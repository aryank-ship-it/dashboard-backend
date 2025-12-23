import express from 'express';
import { Event } from '../models/Event.model';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Get all events for current user
router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const events = await Event.find({ userId: req.userId })
            .sort({ date: 1 });

        res.json(events);
    } catch (error: any) {
        console.error('Get events error:', error);
        res.status(500).json({ error: { message: error.message } });
    }
});

// Create event
router.post('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const { title, date, color, description } = req.body;

        if (!title || !date) {
            return res.status(400).json({
                error: { message: 'Title and date are required' }
            });
        }

        const event = new Event({
            userId: req.userId,
            title,
            date,
            color: color || '#8B5CF6',
            description
        });

        await event.save();
        res.status(201).json(event);
    } catch (error: any) {
        console.error('Create event error:', error);
        res.status(500).json({ error: { message: error.message } });
    }
});

// Update event
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { title, date, color, description } = req.body;

        const event = await Event.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { title, date, color, description },
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({
                error: { message: 'Event not found' }
            });
        }

        res.json(event);
    } catch (error: any) {
        console.error('Update event error:', error);
        res.status(500).json({ error: { message: error.message } });
    }
});

// Delete event
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findOneAndDelete({
            _id: id,
            userId: req.userId
        });

        if (!event) {
            return res.status(404).json({
                error: { message: 'Event not found' }
            });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error: any) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: { message: error.message } });
    }
});

export default router;
