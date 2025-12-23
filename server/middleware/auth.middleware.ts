import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';

export interface AuthRequest extends Request {
    user?: any;
    userId?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: { message: 'Authentication required' } });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ error: { message: 'User not found' } });
        }

        req.user = user;
        req.userId = user._id.toString();
        next();
    } catch (error) {
        res.status(401).json({ error: { message: 'Invalid or expired token' } });
    }
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Import TeamMember inside the function to avoid circular dependency
    const { TeamMember } = await import('../models/TeamMember.model');
    const teamCount = await TeamMember.countDocuments();

    if (!req.user || (req.user.role !== 'admin' && teamCount > 0)) {
        return res.status(403).json({ error: { message: 'Admin access required' } });
    }
    next();
};
