import { Schema, model } from 'mongoose';
import { AuditActorSchema } from './shared.js';
const TestSuiteSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: AuditActorSchema },
    updatedBy: { type: AuditActorSchema },
}, { timestamps: true });
export const TestSuite = model('TestSuite', TestSuiteSchema);
//# sourceMappingURL=TestSuite.js.map