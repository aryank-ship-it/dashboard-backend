import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import teamRoutes from './routes/team.routes';
import taskRoutes from './routes/task.routes';
import eventRoutes from './routes/event.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/team-members', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// Connect to MongoDB and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`🌍 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    });
}).catch((error) => {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
});

export default app;
