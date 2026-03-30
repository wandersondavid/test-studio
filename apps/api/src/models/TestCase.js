import { Schema, model } from 'mongoose';
import { AuditActorSchema } from './shared.js';
const StepRetrySchema = new Schema({
    attempts: { type: Number, required: true, min: 2, max: 100 },
    intervalMs: { type: Number, required: true, min: 250, max: 60 * 60 * 1000 },
}, { _id: false });
const StepApiConditionSchema = new Schema({
    urlContains: { type: String, required: true },
    method: { type: String },
    status: { type: Number },
    responseIncludes: { type: String },
}, { _id: false });
const StepSchema = new Schema({
    id: { type: String, required: true },
    type: { type: String, required: true },
    selector: { type: String },
    selectorAlternatives: { type: [String], default: undefined },
    value: { type: String },
    description: { type: String },
    timeoutMs: { type: Number },
    retry: { type: StepRetrySchema },
    api: { type: StepApiConditionSchema },
}, { _id: false });
const TestCaseSchema = new Schema({
    suiteId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    setupCaseId: { type: String },
    steps: { type: [StepSchema], default: [] },
    createdBy: { type: AuditActorSchema },
    updatedBy: { type: AuditActorSchema },
    lastRecordedBy: { type: AuditActorSchema },
    lastRecordedAt: { type: Date },
}, { timestamps: true });
export const TestCase = model('TestCase', TestCaseSchema);
//# sourceMappingURL=TestCase.js.map