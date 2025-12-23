import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    date: Date;
    color: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    color: {
        type: String,
        default: '#8B5CF6'
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

export const Event = mongoose.model<IEvent>('Event', EventSchema);
