import express from 'express';
import { User } from '../models/User.model';
import { TeamMember } from '../models/TeamMember.model';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Search users (excluding team members)
router.get('/search', authenticate, async (req: AuthRequest, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        if (!q || typeof q !== 'string' || q.trim().length < 2) {
            return res.json({ users: [], total: 0 });
        }

        // Get team members added by the current user to exclude them
        const teamMembers = await TeamMember.find({ addedBy: req.userId }).select('userId');
        const excludedIds = teamMembers.map(tm => tm.userId);

        // Also exclude the current user from their own search
        excludedIds.push(req.userId as any);

        // Search users by name or email, excluding current team members
        const query = {
            _id: { $nin: excludedIds },
            $or: [
                { email: { $regex: q, $options: 'i' } },
                { fullName: { $regex: q, $options: 'i' } }
            ]
        };

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            User.countDocuments(query)
        ]);

        res.json({
            users,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        });
    } catch (error: any) {
        console.error('Search users error:', error);
        res.status(500).json({ error: { message: error.message } });
    }
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res) => {
    try {
        res.json(req.user);
    } catch (error: any) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Update user profile
router.put('/me', authenticate, async (req: AuthRequest, res) => {
    try {
        const { fullName, avatarUrl } = req.body;

        const user = await User.findByIdAndUpdate(
            req.userId,
            { fullName, avatarUrl },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ error: { message: error.message } });
    }
});

export default router;
