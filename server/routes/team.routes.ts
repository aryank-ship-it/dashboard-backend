import express from 'express';
import { TeamMember } from '../models/TeamMember.model';
import { User } from '../models/User.model';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();
router.use(authenticate);

// Get all team members with user details
router.get('/', async (req: AuthRequest, res) => {
    try {
        const teamMembers = await TeamMember.find({ addedBy: req.userId })
            .populate('userId', '-password')
            .populate('addedBy', 'fullName email')
            .sort({ createdAt: -1 });

        // Transform to match frontend interface
        const formattedMembers = teamMembers.map(member => ({
            id: member._id,
            user_id: (member.userId as any)._id,
            added_by: (member.addedBy as any)._id,
            created_at: member.createdAt,
            email: (member.userId as any).email,
            full_name: (member.userId as any).fullName,
            avatar_url: (member.userId as any).avatarUrl,
            role: (member.userId as any).role
        }));

        res.json(formattedMembers);
    } catch (error: any) {
        console.error('Get team members error:', error);
        res.status(500).json({ error: { message: error.message } });
    }
});

// Add team member (all authenticated users)
router.post('/', async (req: AuthRequest, res) => {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                error: { message: 'user_id is required' }
            });
        }

        // Check if user exists
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({
                error: { message: 'User not found' }
            });
        }

        // Check if already a team member FOR THIS OWNER
        const existingMember = await TeamMember.findOne({ userId: user_id, addedBy: req.userId });
        if (existingMember) {
            return res.status(409).json({
                error: { message: 'This user is already in your team' }
            });
        }

        // Add team member
        const teamMember = new TeamMember({
            userId: user_id,
            addedBy: req.userId
        });

        await teamMember.save();

        await teamMember.save();

        // Populate and return
        await teamMember.populate('userId', '-password');
        await teamMember.populate('addedBy', 'fullName email');

        res.status(201).json({
            id: teamMember._id,
            user_id: (teamMember.userId as any)._id,
            added_by: (teamMember.addedBy as any)._id,
            created_at: teamMember.createdAt,
            email: (teamMember.userId as any).email,
            full_name: (teamMember.userId as any).fullName,
            avatar_url: (teamMember.userId as any).avatarUrl,
            role: (teamMember.userId as any).role
        });
    } catch (error: any) {
        console.error('Add team member error:', error);
        res.status(500).json({ error: { message: error.message } });
    }
});

// Remove team member (all authenticated users)
router.delete('/:id', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        const teamMember = await TeamMember.findOneAndDelete({
            _id: id,
            addedBy: req.userId
        });

        if (!teamMember) {
            return res.status(404).json({
                error: { message: 'Team member not found or you do not have permission' }
            });
        }

        res.json({ message: 'Team member removed successfully' });
    } catch (error: any) {
        console.error('Remove team member error:', error);
        res.status(500).json({ error: { message: error.message } });
    }
});

export default router;
