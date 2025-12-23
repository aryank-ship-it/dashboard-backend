import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Validate input
        if (!email || !password || !fullName) {
            return res.status(400).json({
                error: { message: 'Email, password, and full name are required' }
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: { message: 'User with this email already exists' }
            });
        }

        // Create user (first user becomes admin)
        const userCount = await User.countDocuments();
        const user = new User({
            email,
            password,
            fullName,
            role: userCount === 0 ? 'admin' : 'member'
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            user: user.toJSON(),
            token
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ error: { message: error.message } });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: { message: 'Email and password are required' }
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: { message: 'Invalid email or password' }
            });
        }

        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: { message: 'Invalid email or password' }
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            user: user.toJSON(),
            token
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: { message: error.message } });
    }
});

export default router;
