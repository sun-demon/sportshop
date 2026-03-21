import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    iat: number;
    exp: number;
  } | undefined;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  // Adding user information to the request
  req.user = decoded as AuthRequest['user'];
  next();
};
