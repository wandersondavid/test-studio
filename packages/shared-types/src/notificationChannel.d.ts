import type { AuditActor } from './audit';
export type NotificationEvent = 'on_pass' | 'on_fail' | 'always';
export type NotificationChannelType = 'slack' | 'webhook';
export interface NotificationChannel {
    _id: string;
    name: string;
    type: NotificationChannelType;
    url: string;
    events: NotificationEvent[];
    isActive: boolean;
    createdBy?: AuditActor;
    createdAt: string;
    updatedAt: string;
}
export interface CreateNotificationChannelInput {
    name: string;
    type: NotificationChannelType;
    url: string;
    events: NotificationEvent[];
    isActive?: boolean;
}
export interface UpdateNotificationChannelInput {
    name?: string;
    type?: NotificationChannelType;
    url?: string;
    events?: NotificationEvent[];
    isActive?: boolean;
}
//# sourceMappingURL=notificationChannel.d.ts.map