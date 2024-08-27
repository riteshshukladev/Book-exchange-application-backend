import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../config/database.js";
import { eq } from "drizzle-orm";
import { users } from "../db/schema.js";
import bcrypt from "bcrypt";

dotenv.config();

const loginController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const payload = {
      email: user.email,
      name: user.name,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "10",
    });

    res.status(200).json({
      message: "Login Success",
      token: token,
    });
  } catch (err) {
    console.error("Login error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      message: "There was an error while logging in",
    });
  }
};

export default loginController;
