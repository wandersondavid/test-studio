import { Schema, model } from 'mongoose';
import { AuditActorSchema } from './shared.js';
const StepResultSchema = new Schema({
    stepId: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, enum: ['passed', 'failed', 'skipped'], required: true },
    durationMs: { type: Number, required: true },
    error: { type: String },
    screenshotPath: { type: String },
}, { _id: false });
const ConsoleLogSchema = new Schema({
    id: { type: String, required: true },
    stepId: { type: String },
    type: { type: String, enum: ['log', 'info', 'warn', 'error', 'debug', 'trace'], required: true },
    text: { type: String, required: true },
    location: { type: String },
    timestamp: { type: String, required: true },
}, { _id: false });
const NetworkLogSchema = new Schema({
    id: { type: String, required: true },
    stepId: { type: String },
    kind: { type: String, enum: ['request', 'response', 'failed'], required: true },
    method: { type: String },
    url: { type: String, required: true },
    resourceType: { type: String },
    status: { type: Number },
    error: { type: String },
    timestamp: { type: String, required: true },
}, { _id: false });
const TestRunSchema = new Schema({
    caseId: { type: String, required: true },
    environmentId: { type: String, required: true },
    datasetId: { type: String },
    status: { type: String, enum: ['pending', 'running', 'passed', 'failed', 'error'], default: 'pending' },
    requestedBy: { type: AuditActorSchema },
    requestedVia: { type: String, enum: ['web', 'cli', 'history', 'suite', 'scheduled'] },
    sourceRunId: { type: String },
    stepResults: { type: [StepResultSchema], default: [] },
    consoleLogs: { type: [ConsoleLogSchema], default: [] },
    networkLogs: { type: [NetworkLogSchema], default: [] },
    durationMs: { type: Number },
    videoPath: { type: String },
    tracePath: { type: String },
    error: { type: String },
}, { timestamps: true });
export const TestRun = model('TestRun', TestRunSchema);
//# sourceMappingURL=TestRun.js.map