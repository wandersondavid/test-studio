import type { Schedule, CreateScheduleInput, UpdateScheduleInput } from '@test-studio/shared-types';
export declare const schedulesApi: {
    list(): Promise<Schedule[]>;
    get(id: string): Promise<Schedule>;
    create(data: CreateScheduleInput): Promise<Schedule>;
    update(id: string, data: UpdateScheduleInput): Promise<Schedule>;
    delete(id: string): Promise<void>;
    trigger(id: string): Promise<{
        _id: string;
    }>;
};
//# sourceMappingURL=schedules.d.ts.map