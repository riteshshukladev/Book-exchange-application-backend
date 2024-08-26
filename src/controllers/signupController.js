import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { db } from '../config/database.js'
import { eq } from 'drizzle-orm';
import { users } from "../db/schema.js";
import bcrypt from 'bcrypt';

dotenv.config();


const signupController = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User with this email already exists"
            });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        
        const newUser = await db.insert(users).values({
            email,
            name:username,
            passwordHash
        }).returning();

        const payload = {
            email: newUser.email,
            name:newUser.username
        }

        const token = jwt.sign(payload,
            process.env.JWT_SECRET, {
                expiresIn:'1m',
        })

        res.status(200).json({
            message:"login Success",
            token: token
        });
    }

    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "There was an error while signinig up in"
        })
    }

}

export default signupController;