import { Schema, model } from 'mongoose';
import { AuditActorSchema } from './shared.js';
const EnvironmentSchema = new Schema({
    name: { type: String, required: true },
    baseURL: { type: String, required: true },
    type: { type: String, enum: ['local', 'dev', 'hml', 'prod'], required: true },
    headers: { type: Map, of: String, default: {} },
    variables: { type: Map, of: String, default: {} },
    createdBy: { type: AuditActorSchema },
    updatedBy: { type: AuditActorSchema },
}, { timestamps: true });
export const Environment = model('Environment', EnvironmentSchema);
//# sourceMappingURL=Environment.js.map