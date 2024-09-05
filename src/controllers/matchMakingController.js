import dotenv from "dotenv";
import { db } from "../config/database.js";
import { sql } from "drizzle-orm";
import { bookslist } from "../db/schema.js";
import { inArray, like, and, ilike,eq } from "drizzle-orm";

export const MatchingBooks = async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT *
        FROM ${bookslist}
        ORDER BY id ASC
      `);
  
      console.log("Query result for all books:", result);
  
      if (!result || !Array.isArray(result)) {
        throw new Error("Unexpected query result format for books");
      }
  
      const globalBooks = result.map((book) => ({
        id: book.id,
        email: book.email,
        title: book.title,
        author: book.author,
        genre: book.genre,
      }));
  
      console.log(globalBooks)
  
      // MyBooks filter
      const allBooks = await db.query.bookslist.findMany({
        where: eq(bookslist.email, req.user.email),
      });
  
      if (!allBooks || !Array.isArray(allBooks)) {
        throw new Error("Unexpected query result format for books");
      }
  
      const myBooks = allBooks.map((book) => ({
        id: book.id,
        email: book.email,
        title: book.title,
        author: book.author,
        genre: book.genre,
      }));
  
  
      console.log(myBooks);
      console.log("In the function!!!!!!!!")
  
      // Sort the globalBooks array based on the genre counts in myBooks
      const sortedGlobalBooks = sortBooksByGenre(globalBooks, myBooks);
  


      const filteredGlobalBooks = sortedGlobalBooks.filter(e => e.email !== req.user.email )

  
      console.log(sortBooksByGenre);
      try {
        res.status(200).json({
          globalBooks: filteredGlobalBooks,
        });
      } catch (error) {
        console.error("Error sending response:", error);
        res
          .status(500)
          .json({ error: "Error while fetching matchmaking books", details: error.message });
      }
    } catch (error) {
      console.error("Error fetching matchmaking Books:", error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  };
  
  function sortBooksByGenre(globalBooks, myBooks) {
    // 1. Count the number of books per genre in myBooks
    const genreCounts = {};
    myBooks.forEach((book) => {
      if (genreCounts[book.genre]) {
        genreCounts[book.genre]++;
      } else {
        genreCounts[book.genre] = 1;
      }
    });
  
    // 2. Sort the globalBooks array based on the genre counts
    return globalBooks.sort((a, b) => {
      const aCount = genreCounts[a.genre] || 0;
      const bCount = genreCounts[b.genre] || 0;
      return bCount - aCount;
    });
  }