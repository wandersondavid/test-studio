import { Schema, model } from 'mongoose';
import { AuditActorSchema } from './shared.js';
const NotificationChannelSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['slack', 'webhook'], required: true },
    url: { type: String, required: true },
    events: {
        type: [String],
        enum: ['on_pass', 'on_fail', 'always'],
        required: true,
        default: ['on_fail'],
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: AuditActorSchema },
}, { timestamps: true });
export const NotificationChannel = model('NotificationChannel', NotificationChannelSchema);
//# sourceMappingURL=NotificationChannel.js.map