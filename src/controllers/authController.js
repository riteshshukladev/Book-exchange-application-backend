import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { accessTokenGenerator } from ".././services/auth.js";

dotenv.config();

const protectedRouterController = (req, res) => {
  const token = req.cookies.accessToken;

  console.log("request arrived at the refreshController");
  if (!token) return res.status(401).json({ messge: "unauthorized" });

  try {
    console.log("Inside the try block in the authProtectedController");
    const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("is user verified" + verifiedUser)
    res.json({ messge: "Access granted", id: verifiedUser.email, status: 200 });
  } catch (err) {
    res.status(404).json({ message: "Forbidden" });
  }
};

const refreshTokenController = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    console.log("Inside the 403 top error");
    return res.status(403).json({ message: "no refresh token found" });
  }

  try {
    const verified = jwt.verify(refreshToken, process.env.JWT_REFRESH);
    const payload = {
      name: verified.name,
      email: verified.email,
    };
    const newAccessToken = accessTokenGenerator(payload);
    console.log(payload);
    if (!newAccessToken) {
      return res
        .status(500)
        .json({ message: "failed to generate the new access token" });
    }

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1 * 60 * 1000,
    });

    res.status(200).json({ message: "Access token refreshed" });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(401).json({ message: "Their was error logging out the user" });
  }
};

export { logout, refreshTokenController, protectedRouterController };
