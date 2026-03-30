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
const ReusableBlockParameterSchema = new Schema({
    key: { type: String, required: true },
    label: { type: String },
    description: { type: String },
    required: { type: Boolean, default: true },
    defaultValue: { type: String },
    secret: { type: Boolean, default: false },
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
const ReusableBlockSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    steps: { type: [StepSchema], default: [] },
    parameters: { type: [ReusableBlockParameterSchema], default: [] },
    createdBy: { type: AuditActorSchema },
    updatedBy: { type: AuditActorSchema },
}, { timestamps: true });
export const ReusableBlock = model('ReusableBlock', ReusableBlockSchema);
//# sourceMappingURL=ReusableBlock.js.map