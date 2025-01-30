import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const accessTokenGenerator = (user) => {
  if (!user?.email || !user?.name) {
    throw new Error("Invalid user object");
  }
  try {
    return jwt.sign(
      { name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );
  } catch (error) {
    throw new Error(`Error Generating the access token:${error.message}`);
  }
};

const refreshTokenGenerator = (user) => {
  if (!user?.email || !user?.name) {
    throw new Error("Invalid user object");
  }
  try {
    return jwt.sign({ email: user.email, name:user.name }, process.env.JWT_REFRESH, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    });
  } catch (error) {
    throw new Error(`Error Generating the access token:${error.message}`);
  }
};

const verifyRefreshToken = (token) => {
  try {
      return jwt.verify(token, process.env.JWT_REFRESH);
  } catch (error) {
      throw new Error('Invalid refresh token');
  }
};



export { refreshTokenGenerator, accessTokenGenerator, verifyRefreshToken };
