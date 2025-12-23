import mongoose from 'mongoose';
import process from 'node:process';

export const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://aryan:18032005@cluster0.eo6sytj.mongodb.net/';

        await mongoose.connect(mongoURI);

        console.log('✅ MongoDB connected successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err: Error) => {
    console.error('❌ MongoDB error:', err);
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
});
