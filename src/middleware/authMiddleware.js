
import extractPayload from "../services/extractPayLoad.js";

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Auth Header:', authHeader); // New log

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    console.log('Extracted Token:', token); // New log

    const payload = extractPayload(token);
    console.log('Extracted Payload:', payload); // New log

    if (!payload || !payload.email) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = payload;
    next();
};

export default authMiddleware;