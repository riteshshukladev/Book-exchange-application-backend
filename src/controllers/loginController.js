import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../config/database.js";
import { eq } from "drizzle-orm";
import { users } from "../db/schema.js";
import bcrypt from "bcrypt";
import {
  accessTokenGenerator,
  refreshTokenGenerator,
} from "../services/auth.js";
// import cookieParser from "cookie-parser";

dotenv.config();

const loginController = async (req, res) => {
  const { email, password } = req.body;
  console.log("recieved req body" + email + "and" + password);
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
    // const token = jwt.sign(payload, process.env.JWT_SECRET, {
    //   expiresIn: "15d",
    // });

    const accessToken = accessTokenGenerator(payload);
    const refreshToken = refreshTokenGenerator(payload);

    // console.log("login with the token " + token)

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login Success",
      status: 200,
    });

  } catch (err) {
    console.log("error in login");
    console.error("Login error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      message: "There was an error while logging in",
    });
  }
};

export default loginController;
