import dotenv from "dotenv";
import { db } from "../config/database.js";
import { sql } from "drizzle-orm";
import { bookslist } from "../db/schema.js";
import { inArray, like, and, ilike, eq } from "drizzle-orm";



const getAllFilters = async (req, res) => {
  // Get the email from the authenticated user.
  const userEmail = req.user.email;

  try {
    const [authors, genres, books] = await Promise.all([
      
      db.execute(sql`
        SELECT DISTINCT author
        FROM ${bookslist}
        ORDER BY author ASC
      `),
      // Genres Query
      db.execute(sql`
        SELECT DISTINCT unnest(string_to_array(genre, ',')) as genre
        FROM ${bookslist}
        ORDER BY genre ASC
      `),
      // Books Query: Exclude the logged-in user's books
      db.execute(sql`
        SELECT *
        FROM ${bookslist}
        WHERE email <> ${userEmail}
        ORDER BY id ASC
      `),
    ]);

    // Validate results
    if (!authors?.length || !genres?.length || !books?.length) {
      throw new Error("Invalid query results");
    }

    // Format data
    const formattedResponse = {
      allAuthors: authors.map((row) => ({
        value: row.author,
        label: row.author,
      })),
      allGenres: genres.map((row) => ({
        value: row.genre,
        label: row.genre,
      })),
      allBooks: books.map((book) => ({
        id: book.id,
        email: book.email,
        title: book.title,
        author: book.author,
        genre: book.genre,
      })),
    };

    console.log(formattedResponse);
    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error("Error fetching filter data:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

const filteredBooks = async (req, res) => {
  try {
    const { authors, genres, searchTerm } = req.body;
    let query = db.select().from(bookslist);

    const conditions = [];

    if (authors && authors.length > 0) {
      conditions.push(inArray(bookslist.author, authors));
    }

    if (genres && genres.length > 0) {
      conditions.push(inArray(bookslist.genre, genres));
    }

    if (searchTerm) {
      conditions.push(ilike(bookslist.title, `%${searchTerm}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const filteredBooks = await query;
    res.json({ filteredBooks });
  } catch (error) {
    console.error("Error filtering books:", error);
    res.status(500).json({ error: "An error occurred while filtering books" });
  }
};

export { getAllFilters, filteredBooks };
