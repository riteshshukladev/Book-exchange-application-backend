import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../config/database.js";
import { eq } from "drizzle-orm";
import { bookslist, users } from "../db/schema.js";
import bcrypt from "bcrypt";

const initialFetchUserData = async (req, res) => {
  try {
    const fetchUserDetails = await db.query.users.findFirst({
      where: eq(bookslist.email, req.user.email),
    });
    console.log(fetchUserDetails);

    res.status(200).json({
      data: fetchUserDetails,
      message: "SuccessFull retrieval",
    });
  } catch (err) {
    console.error("Error fetching Initial profile details:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;

    const updatedUser = await db
      .update(users)
      .set(updates)
      .where(eq(users.email, req.user.email))
      .returning();

    if (updatedUser.length == 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { passwordHash, ...data } = updatedUser[0];
    res.status(200).json({data, message:"Profile updated successfully"});
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

export { initialFetchUserData,updateUserProfile };
