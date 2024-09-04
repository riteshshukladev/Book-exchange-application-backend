import { db } from "../config/database.js";
import { and, count, eq, sql } from "drizzle-orm";
import { bookslist, exchange } from "../db/schema.js";

const getBooks = async (req, res) => {
  try {
    const allBooks = await db.query.bookslist.findMany({
      where: eq(bookslist.email, req.user.email),
    })
    console.log(allBooks);
    res.status(200).json({
      data: allBooks,
      message: "Successful retrieval of data",
    });
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


const addBook = async (req, res) => {
  const email = req.user.email;
  const { title, author, genre } = req.body;

  try {
    const existingBooks = await db
      .select({ count: sql`cast(count(*) as integer)` })
      .from(bookslist)
      .where(
        and(
          eq(bookslist.email, email),
          eq(bookslist.title, title),
          eq(bookslist.author, author)
        )
      );

    if (existingBooks[0].count > 0) {
      return res.status(400).json({ message: "Book already exists" });
    }

    const newBook = await db
      .insert(bookslist)
      .values({
        email,
        title,
        author,
        genre,
      })
      .returning();

    res.status(201).json({
      data: newBook[0],
      message: "Book added successfully",
    });
  } catch (err) {
    console.error("Error adding book:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


const editBook = async (req, res) => {
    
  const { id, title, author, genre } = req.body;
  try {
    const updatedBook = await db
      .update(bookslist)
      .set({ title, author, genre })
      .where(eq(bookslist.id, id))
      .returning();

    if (updatedBook.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      data: updatedBook[0],
      message: "Book updated successfully",
    });
  } catch (err) {
    console.error("Error updating book:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteBook = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const deletedBook = await db
      .delete(bookslist)
      .where(eq(bookslist.id, id))
      .returning();

    if (deletedBook.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      data: deletedBook[0],
      message: "Book deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { getBooks, addBook, editBook, deleteBook };
