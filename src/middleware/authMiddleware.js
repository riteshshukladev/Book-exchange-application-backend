import jwt from "jsonwebtoken";
import { refreshTokenGenerator } from "../services/auth.js";

const authMiddleware = (req, res, next) => {
  try {
    // Check cookies first
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.user = payload;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          return res.status(401).json({ message: "Refresh token required" });
        }

        try {
          const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH);
          const newAccessToken = refreshTokenGenerator({
            email: payload.email,
            name: payload.name,
          });

          // Set new access token
          res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, 
          });

          req.user = payload;
          next();
        } catch (refreshError) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }
      } else {
        return res.status(401).json({ message: "Invalid token" });
      }
    }
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default authMiddleware;
