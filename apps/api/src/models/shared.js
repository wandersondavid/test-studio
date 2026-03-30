import { Schema } from 'mongoose';
export const AuditActorSchema = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], required: true },
}, { _id: false });
//# sourceMappingURL=shared.js.map