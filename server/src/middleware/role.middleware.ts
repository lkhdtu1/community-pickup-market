import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

export const checkRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
      return;
    }

    next();
  };
};