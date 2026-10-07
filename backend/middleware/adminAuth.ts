// middleware/adminAuth.ts
import { Request, Response, NextFunction } from 'express';

export default (req: any, res: Response, next: NextFunction) => {
  // The auth middleware must run before this to populate req.user
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    return res.status(403).json({ msg: 'Authorization denied: Not an admin' });
  }
};