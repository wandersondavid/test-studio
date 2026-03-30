import { ISchedule } from '../models/Schedule.js';
import type { AuditActor } from '@test-studio/shared-types';
export interface CreateScheduleData {
    name: string;
    cron: string;
    caseId: string;
    environmentId: string;
    datasetId?: string;
    isActive?: boolean;
    createdBy?: AuditActor;
}
export interface UpdateScheduleData {
    name?: string;
    cron?: string;
    caseId?: string;
    environmentId?: string;
    datasetId?: string;
    isActive?: boolean;
}
export declare class ScheduleService {
    find(): Promise<ISchedule[]>;
    findById(id: string): Promise<ISchedule | null>;
    findAllActive(): Promise<ISchedule[]>;
    create(data: CreateScheduleData): Promise<ISchedule>;
    update(id: string, data: UpdateScheduleData): Promise<ISchedule | null>;
    remove(id: string): Promise<ISchedule | null>;
    updateLastRun(id: string): Promise<void>;
}
//# sourceMappingURL=schedule.service.d.ts.map