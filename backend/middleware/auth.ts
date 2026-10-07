// middleware/auth.ts
import jwt from 'jsonwebtoken';

interface JwtPayload {
    user: {
        id: string;
        name: string;
        email: string;
        userType: string;
    };
    iat: number;
    exp: number;
}

export default function (req: any, res: any, next: any) {
    // Check for the 'Authorization' header first, which is standard
    const authHeader = req.header('Authorization');

    // Fallback to 'x-auth-token' if 'Authorization' is not present
    let token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        // Extract the token from the "Bearer <token>" string
        token = authHeader.split(' ')[1];
    } else {
        token = req.header('x-auth-token');
    }

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey') as JwtPayload;
        req.user = decoded.user;
        next();
    } catch (err: any) {
        // Handle specific JWT errors gracefully
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Session expired. Please log in again.' });
        }
        // For any other token-related errors (e.g., malformed token)
        res.status(401).json({ msg: 'Token is not valid' });
    }
};