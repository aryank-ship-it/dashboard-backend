import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password: string;
    fullName: string;
    avatarUrl?: string;
    role: 'admin' | 'member';
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatarUrl: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
    }
}, {
    timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error: any) {
        throw error;
    }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.set('toJSON', {
    transform: (_doc: any, ret: any) => {
        delete ret.password;
        return ret;
    }
});

export const User = mongoose.model<IUser>('User', UserSchema);
