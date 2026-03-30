import { Document, Types } from 'mongoose';
import type { AuditActor } from '@test-studio/shared-types';
export interface ISchedule extends Document {
    name: string;
    cron: string;
    caseId: Types.ObjectId;
    environmentId: Types.ObjectId;
    datasetId?: Types.ObjectId;
    isActive: boolean;
    lastRunAt?: Date;
    nextRunAt?: Date;
    createdBy?: AuditActor;
}
export declare const ScheduleModel: any;
//# sourceMappingURL=Schedule.d.ts.map