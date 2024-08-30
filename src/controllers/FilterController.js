// import dotenv from "dotenv";
// import { db } from "../config/database.js";
// import { sql } from "drizzle-orm";
// import { bookslist } from "../db/schema.js";

// const allAuthors = async (req, res) => {
//     try {
//         const allAuthorsName = await db.execute(sql`
//             SELECT DISTINCT author
//             FROM ${bookslist}
//             ORDER BY author ASC
//             `);
//             console.log(allAuthorsName)
//             console.log(typeof(allAuthorsName));
            
//         const AuthorsNameFormatted = allAuthorsName.rows.map(row => ({
//             value: row.author,
//             label: row.author
//         }));

        
//         res.status(200).json({
//             AuthorsNameFormatted
//         });
//     } catch (error) {
//         console.error("Error fetching authors:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };


// const allGenres = async (req, res) => {
//     try {
//         const allGenresName = await db.execute(sql`
//             SELECT DISTINCT genre
//             FROM ${bookslist}
//             ORDER BY author ASC
//         `);
        
//         const GenresNameFormatted = allGenresName.rows.map(row => ({
//             value: row.genre,
//             label: row.genre
//         }));
        
//         res.status(200).json({
//             GenresNameFormatted
//         });
//     } catch (error) {
//         console.error("Error fetching Genre:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };



// const allBooks = async (req, res) => {
//     try {
//         const allGenresName = await db.execute(sql`
//             SELECT *
//             FROM ${bookslist}
//             ORDER BY author ASC
//         `);
        
//         const formattedBooks = allBooks.rows.map(book => ({
//             id: book.id,
//             email: book.email,
//             title: book.title,
//             author: book.author,
//             genre: book.genre
//         }));

//          res.status(200).json({
//             books: formattedBooks
//         });
//     } catch (error) {
//         console.error("Error fetching All Books:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };



// export { allAuthors,allGenres, allBooks };


import dotenv from "dotenv";
import { db } from "../config/database.js";
import { sql } from "drizzle-orm";
import { bookslist } from "../db/schema.js";

const allAuthors = async (req, res) => {
    try {
        const result = await db.execute(sql`
            SELECT DISTINCT author
            FROM ${bookslist}
            ORDER BY author ASC
        `);
        
        console.log("Query result:", result);

        if (!result || !Array.isArray(result)) {
            throw new Error("Unexpected query result format");
        }

        const AuthorsNameFormatted = result.map(row => ({
            value: row.author,
            label: row.author
        }));

        console.log(AuthorsNameFormatted);
        
        try {
            res.status(200).json({
              AuthorsNameFormatted
            });
          } catch (error) {
            console.error("Error sending response:", error);
            res.status(500).json({ error: "Error sending response", details: error.message });
          }
    } catch (error) {
        console.error("Error fetching authors:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

const allGenres = async (req, res) => {
    try {
        // const result = await db.execute(sql`
        //     SELECT DISTINCT unnest(genre) as genre
        //     FROM ${bookslist}
        //     ORDER BY genre ASC
        // `);

        const result = await db.execute(sql`
            SELECT DISTINCT unnest(string_to_array(genre, ',')) as genre
            FROM ${bookslist}
            ORDER BY genre ASC
        `);
        
        console.log("Query result for genres:", result);

        if (!result || !Array.isArray(result)) {
            throw new Error("Unexpected query result format for genres");
        }

        const GenresNameFormatted = result.map(row => ({
            value: row.genre,
            label: row.genre
        }));
        console.log(GenresNameFormatted)
        try {
            res.status(200).json({
              GenresNameFormatted
            });
          } catch (error) {
            console.error("Error sending response:", error);
            res.status(500).json({ error: "Error sending response", details: error.message });
          }
    } catch (error) {
        console.error("Error fetching Genre:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

const allBooks = async (req, res) => {
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

        const formattedBooks = result.map(book => ({
            id: book.id,
            email: book.email,
            title: book.title,
            author: book.author,
            genre: book.genre
        }));

        try {
            res.status(200).json({
              formattedBooks
            });
          } catch (error) {
            console.error("Error sending response:", error);
            res.status(500).json({ error: "Error sending response", details: error.message });
          }
    } catch (error) {
        console.error("Error fetching All Books:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

export { allAuthors, allGenres, allBooks };