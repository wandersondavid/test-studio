import { INotificationChannel } from '../models/NotificationChannel.js';
import type { ITestRun } from '../models/TestRun.js';
export declare class NotificationChannelService {
    findAll(): Promise<INotificationChannel[]>;
    findById(id: string): Promise<INotificationChannel | null>;
    findActive(): Promise<INotificationChannel[]>;
    create(data: Partial<INotificationChannel>): Promise<INotificationChannel>;
    update(id: string, data: Partial<INotificationChannel>): Promise<INotificationChannel | null>;
    delete(id: string): Promise<void>;
}
export declare function sendNotification(run: ITestRun, channels: INotificationChannel[], caseName: string): Promise<void>;
//# sourceMappingURL=notificationChannel.service.d.ts.map