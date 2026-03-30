import { Schema, model } from 'mongoose';
import { AuditActorSchema } from './shared.js';
const DatasetSchema = new Schema({
    name: { type: String, required: true },
    variables: { type: Map, of: String, default: {} },
    createdBy: { type: AuditActorSchema },
    updatedBy: { type: AuditActorSchema },
}, { timestamps: true });
export const Dataset = model('Dataset', DatasetSchema);
//# sourceMappingURL=Dataset.js.map