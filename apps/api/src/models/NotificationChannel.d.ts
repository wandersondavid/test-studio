import { Document } from 'mongoose';
import type { AuditActor, NotificationEvent, NotificationChannelType } from '@test-studio/shared-types';
export interface INotificationChannel extends Document {
    name: string;
    type: NotificationChannelType;
    url: string;
    events: NotificationEvent[];
    isActive: boolean;
    createdBy?: AuditActor;
}
export declare const NotificationChannel: import("mongoose").Model<INotificationChannel, {}, {}, {}, Document<unknown, {}, INotificationChannel, {}, {}> & INotificationChannel & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=NotificationChannel.d.ts.map