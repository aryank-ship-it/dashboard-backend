import express from 'express';
import { Task } from '../models/Task.model';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Get all tasks for current user
router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const tasks = await Task.find({ userId: req.userId })
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error: any) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: { message: error.message } });
    }
});

// Create task
router.post('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;

        if (!title) {
            return res.status(400).json({
                error: { message: 'Title is required' }
            });
        }

        const task = new Task({
            userId: req.userId,
            title,
            description,
            status: status || 'todo',
            priority: priority || 'medium',
            dueDate
        });

        await task.save();
        res.status(201).json(task);
    } catch (error: any) {
        console.error('Create task error:', error);
        res.status(500).json({ error: { message: error.message } });
    }
});

// Update task
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, dueDate } = req.body;

        const task = await Task.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { title, description, status, priority, dueDate },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                error: { message: 'Task not found' }
            });
        }

        res.json(task);
    } catch (error: any) {
        console.error('Update task error:', error);
        res.status(500).json({ error: { message: error.message } });
    }
});

// Delete task
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findOneAndDelete({
            _id: id,
            userId: req.userId
        });

        if (!task) {
            return res.status(404).json({
                error: { message: 'Task not found' }
            });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error: any) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: { message: error.message } });
    }
});

export default router;
