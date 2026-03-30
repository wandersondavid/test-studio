import { Schema, model } from 'mongoose';
import { AuditActorSchema } from './shared.js';
const AuditLogSchema = new Schema({
    entityType: {
        type: String,
        enum: ['environment', 'suite', 'case', 'dataset', 'run', 'reusable-block', 'user', 'auth'],
        required: true,
    },
    entityId: { type: String, required: true },
    action: { type: String, required: true },
    summary: { type: String, required: true },
    actor: { type: AuditActorSchema, required: true },
    metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
export const AuditLog = model('AuditLog', AuditLogSchema);
//# sourceMappingURL=AuditLog.js.map