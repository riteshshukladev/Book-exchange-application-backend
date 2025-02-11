// src/controllers/BookExchangeController.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../config/database.js";
import { eq, and, or } from "drizzle-orm";
import { users, exchange, bookslist } from "../db/schema.js";
import { broadcastNotification } from "../utils/sse.js";
import { broadcastExchangeCounts } from "../utils/sse.js";
import { scheduleExchangeDeletion } from "../utils/scheduler.js";
import { pool } from "../utils/pgpool.js";

const BookExchangeIntializer = async (req, res) => {
  const { selectedBook, userReplaceBook } = req.body;

  if (
    req.user.email === userReplaceBook.email &&
    req.user.email !== selectedBook.email
  ) {
    try {
      // Check if an exchange already exists for these books
      const existingExchange = await db.query.exchange.findFirst({
        where: and(
          or(
            eq(exchange.ownerBookId, selectedBook.id),
            eq(exchange.ownerBookId, userReplaceBook.id),
            eq(exchange.requesterBookId, selectedBook.id),
            eq(exchange.requesterBookId, userReplaceBook.id)
          ),
          eq(exchange.status, "pending")
        ),
      });

      if (existingExchange) {
        return res.status(400).json({
          message: "One or both books are already part of a pending exchange",
        });
      }

      // Check if both books exist in the bookslist
      const [book1, book2] = await Promise.all([
        db.query.bookslist.findFirst({
          where: eq(bookslist.id, selectedBook.id),
        }),
        db.query.bookslist.findFirst({
          where: eq(bookslist.id, userReplaceBook.id),
        }),
      ]);

      if (!book1 || !book2) {
        return res.status(404).json({
          success: false,
          message: "One or both books not found",
        });
      }

      // Create the new exchange request
      const newExchangeRequest = await db
        .insert(exchange)
        .values({
          requesterEmail: userReplaceBook.email,
          ownerEmail: selectedBook.email,
          requesterBookId: userReplaceBook.id,
          ownerBookId: selectedBook.id,
          status: "pending",
        })
        .returning();

      // Broadcast the new exchange event
      broadcastNotification({
        event: "new-exchange",
        data: newExchangeRequest,
      });

      await broadcastExchangeCounts();
      res.status(200).json({
        message: `Exchange request sent to ${selectedBook.email}`,
      });
    } catch (err) {
      console.log("Error while initiating the request", err);
      res.status(500).json({ message: "Internal server problem" });
    }
  } else {
    console.log("User not authenticated to access the database");
    res.status(401).json({ message: "Unauthorized" });
  }
};

const fetchExchangeDetails = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const incomingRequests = await db
      .select()
      .from(exchange)
      .where(eq(exchange.ownerEmail, userEmail));

    // Query for outgoing requests
    const outgoingRequests = await db
      .select()
      .from(exchange)
      .where(eq(exchange.requesterEmail, userEmail));

    // Format the results
    const formatExchanges = (exchanges) =>
      exchanges.map((ex) => ({
        id: ex.id,
        status: ex.status,
        book1: { id: ex.requesterBookId, owner: { email: ex.requesterEmail }, name:ex.boo },
        book2: { id: ex.ownerBookId, owner: { email: ex.ownerEmail } },
        createdAt: ex.createdAt,
        updatedAt: ex.updatedAt,
        completedAt: ex.completedAt,
      }));

    res.json({
      incoming: formatExchanges(incomingRequests),
      my_requests: formatExchanges(outgoingRequests),
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching exchange data" });
  }
};

const approveBookExchange = async (req, res) => {
  const { book1, book2 } = req.body; // these should be the IDs for the books involved
  let client;
  try {
    // Get a client from the pool (from pg)
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // 1. Find the pending exchange record.
    const exchangeQuery = `
      SELECT *
      FROM exchange
      WHERE requester_book_id = $1
        AND owner_book_id = $2
        AND status = 'pending'
      LIMIT 1
    `;
    const exchangeResult = await client.query(exchangeQuery, [book1, book2]);
    if (exchangeResult.rows.length === 0) {
      throw new Error("Exchange record not found or already processed");
    }
    const exchangeRecord = exchangeResult.rows[0];

    // Validate required fields
    if (!exchangeRecord.requester_email || !exchangeRecord.owner_email) {
      throw new Error("Exchange record missing required email information");
    }
    console.log("Exchange Record:", exchangeRecord);

    // 2. Swap the books.
    // For the book currently owned by the owner (owner_book_id), set its owner to the requester.
    const updateBookOwner1 = `
      UPDATE bookslist
      SET email = $1
      WHERE id = $2
    `;
    await client.query(updateBookOwner1, [
      exchangeRecord.requester_email,
      exchangeRecord.owner_book_id,
    ]);

    // For the book currently owned by the requester (requester_book_id), set its owner to the owner.
    const updateBookOwner2 = `
      UPDATE bookslist
      SET email = $1
      WHERE id = $2
    `;
    await client.query(updateBookOwner2, [
      exchangeRecord.owner_email,
      exchangeRecord.requester_book_id,
    ]);

    // 3. Update the exchange record as approved.
    const updateExchangeQuery = `
      UPDATE exchange
      SET status = 'approved',
          updated_at = NOW(),
          completed_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const updateExchangeResult = await client.query(updateExchangeQuery, [
      exchangeRecord.id,
    ]);
    const updatedExchange = updateExchangeResult.rows[0];

    // Commit the transaction
    await client.query("COMMIT");

    // Broadcast notifications and update counts.
    broadcastNotification({
      event: "exchange-approved",
      data: updatedExchange,
    });
    await broadcastExchangeCounts();

    // Schedule deletion of the processed exchange record after 10 minutes.
    scheduleExchangeDeletion(updatedExchange.id);

    res.status(200).json({
      success: true,
      message: "Exchange approved successfully; books have been swapped.",
      data: updatedExchange,
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Error in approveBookExchange:", error);
    res.status(400).json({ success: false, message: error.message });
  } finally {
    if (client) client.release();
  }
};

const declineBookExchange = async (req, res) => {
  const { book1, book2 } = req.body;

  console.log(book1);
  console.log(book2);
  try {
    const result = await db.transaction(async (tx) => {
      const [exchangeRecord] = await tx
        .select()
        .from(exchange)
        .where(
          and(
            eq(exchange.requesterBookId, book1),
            eq(exchange.ownerBookId, book2),
            eq(exchange.status, "pending")
          )
        )
        .limit(1);

      if (!exchangeRecord) {
        throw new Error("Exchange record not found or already processed");
      }

      const [updatedExchange] = await tx
        .update(exchange)
        .set({
          status: "declined",
          updatedAt: new Date(),
          completedAt: new Date(),
        })
        .where(eq(exchange.id, exchangeRecord.id))
        .returning();

      return updatedExchange;
    });

    // Broadcast the decline event
    broadcastNotification({
      event: "exchange-declined",
      data: result,
    });

    await broadcastExchangeCounts();

    scheduleExchangeDeletion(result.id);

    return res.status(200).json({
      success: true,
      message: "Exchange declined successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in declineBookExchange:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export {
  BookExchangeIntializer,
  fetchExchangeDetails,
  approveBookExchange,
  declineBookExchange,
};
