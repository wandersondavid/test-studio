import { Schema, model } from 'mongoose';
import { AuditActorSchema } from './shared.js';
const ScheduleSchema = new Schema({
    name: { type: String, required: true },
    cron: { type: String, required: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'TestCase', required: true },
    environmentId: { type: Schema.Types.ObjectId, ref: 'Environment', required: true },
    datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset' },
    isActive: { type: Boolean, default: true },
    lastRunAt: { type: Date },
    nextRunAt: { type: Date },
    createdBy: { type: AuditActorSchema },
}, { timestamps: true });
export const ScheduleModel = model('Schedule', ScheduleSchema);
//# sourceMappingURL=Schedule.js.map