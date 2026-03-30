import type { NotificationChannel, CreateNotificationChannelInput, UpdateNotificationChannelInput } from '@test-studio/shared-types';
export declare const notificationChannelsApi: {
    list(): Promise<NotificationChannel[]>;
    get(id: string): Promise<NotificationChannel>;
    create(data: CreateNotificationChannelInput): Promise<NotificationChannel>;
    update(id: string, data: UpdateNotificationChannelInput): Promise<NotificationChannel>;
    delete(id: string): Promise<void>;
    test(id: string): Promise<{
        ok: boolean;
    }>;
};
//# sourceMappingURL=notificationChannels.d.ts.map