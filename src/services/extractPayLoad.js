import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.JWT_SECRET);

const extractPayload = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            console.error('Invalid token:', error.message);
        } else if (error instanceof jwt.TokenExpiredError) {
            console.error('Token expired:', error.message);
        } else {
            console.error('Error decoding token:', error);
        }
        return null;
    }
};

export default extractPayload;