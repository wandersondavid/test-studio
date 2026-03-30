import { api } from './api'
import type {
  NotificationChannel,
  CreateNotificationChannelInput,
  UpdateNotificationChannelInput,
} from '@test-studio/shared-types'

export const notificationChannelsApi = {
  list(): Promise<NotificationChannel[]> {
    return api.get<NotificationChannel[]>('/notification-channels').then(r => r.data)
  },

  get(id: string): Promise<NotificationChannel> {
    return api.get<NotificationChannel>(`/notification-channels/${id}`).then(r => r.data)
  },

  create(data: CreateNotificationChannelInput): Promise<NotificationChannel> {
    return api.post<NotificationChannel>('/notification-channels', data).then(r => r.data)
  },

  update(id: string, data: UpdateNotificationChannelInput): Promise<NotificationChannel> {
    return api.put<NotificationChannel>(`/notification-channels/${id}`, data).then(r => r.data)
  },

  delete(id: string): Promise<void> {
    return api.delete(`/notification-channels/${id}`).then(() => undefined)
  },

  test(id: string): Promise<{ ok: boolean }> {
    return api.post<{ ok: boolean }>(`/notification-channels/${id}/test`).then(r => r.data)
  },
}
