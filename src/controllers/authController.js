import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { refreshTokenGenerator } from ".././services/auth.js";

dotenv.config();

const protectedRouterController = (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json({ messge: "unauthorized" });

  try {
    const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ messge: "Access granted", id: verifiedUser.email, status: 200 });
  } catch (err) {
    res.status(403).json({ message: "Forbidden" });
  }
};

const refreshTokenController = (req, res) => {
  const refreshToken = req.cookies.accessToken;
  if (!refreshToken)
    return res.status(403).json({ message: "no refresh token found" });

  try {
    const verified = jwt.verify(refreshToken, process.env.JWT_REFRESH);
    const payload = {
      name: verified.name,
      email: verified.email,
    };
    const newAccessToken = refreshTokenGenerator(payload);

    res.cookies("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "strict",
    });
    res.status(200).json({ message: "Access token refreshed" });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};


const logout = (req, res) => {
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
}

export {logout,refreshTokenController,protectedRouterController}