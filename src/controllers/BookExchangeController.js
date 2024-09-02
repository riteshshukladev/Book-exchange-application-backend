import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../config/database.js";
import { eq } from "drizzle-orm";
import { users,exchange,bookslist } from "../db/schema.js";
import bcrypt from "bcrypt";


const BookExchangeIntializer = async (req, res) => {
    const { selectedBook, userReplaceBook } = req.body;

    if (req.user.email === userReplaceBook.email && req.user.email !== selectedBook.email) {

        try {
            const newExchangeRequest = await db.insert(exchange).values({
                requesterEmail: userReplaceBook.email,
                ownerEmail: selectedBook.email,
                requesterBookId: userReplaceBook.id,
                ownerBookId: selectedBook.id,
                status: "pending",
            }).returning();

            res.status(200).json({
                message:` Exchange request has been send to the ${selectedBook.email}`
            })
        }
        catch (err) {
            console.log("Error while initiating the request", err);
            res.status(500).json({messsage:"Internal server problem"})
        }
        
    }
    else {
        console.log('user not authenticated to access the database');
    }
}


export {BookExchangeIntializer}