import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../config/database.js";
import { eq, and,or } from "drizzle-orm";
import { users, exchange, bookslist } from "../db/schema.js";

const BookExchangeIntializer = async (req, res) => {
  const { selectedBook, userReplaceBook } = req.body;

  if (
    req.user.email === userReplaceBook.email &&
    req.user.email !== selectedBook.email
  ) {
    try {
      // existing check for the books
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

      res.status(200).json({
        message: ` Exchange request has been send to the ${selectedBook.email}`,
      });
    } catch (err) {
      console.log("Error while initiating the request", err);
      res.status(500).json({ message: "Internal server problem" });
    }
  } else {
    console.log("user not authenticated to access the database");
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
        book1: {
          id: ex.requesterBookId,
          owner: { email: ex.requesterEmail },
        },
        book2: {
          id: ex.ownerBookId,
          owner: { email: ex.ownerEmail },
        },
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
  const { book1, book2 } = req.body;
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
          status: "approved",
          updatedAt: new Date(),
          completedAt: new Date(),
        })
        .where(eq(exchange.id, exchangeRecord.id))
        .returning();

      return updatedExchange;
    });
    res.status(200).json({
      success: true,
      message: "Exchange approved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in approveBookExchange:", error);
    return res.status(400).json({ success: false, message: error.message });
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

      // Update the exchange status to 'declined'
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
