import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamMember extends Document {
    userId: mongoose.Types.ObjectId;
    addedBy: mongoose.Types.ObjectId;
    createdAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Compound index to ensure a user is only added once PER owner
TeamMemberSchema.index({ userId: 1, addedBy: 1 }, { unique: true });

export const TeamMember = mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
