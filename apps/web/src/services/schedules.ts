import { api } from './api'
import type {
  Schedule,
  CreateScheduleInput,
  UpdateScheduleInput,
} from '@test-studio/shared-types'

export const schedulesApi = {
  list(): Promise<Schedule[]> {
    return api.get<Schedule[]>('/schedules').then(r => r.data)
  },

  get(id: string): Promise<Schedule> {
    return api.get<Schedule>(`/schedules/${id}`).then(r => r.data)
  },

  create(data: CreateScheduleInput): Promise<Schedule> {
    return api.post<Schedule>('/schedules', data).then(r => r.data)
  },

  update(id: string, data: UpdateScheduleInput): Promise<Schedule> {
    return api.put<Schedule>(`/schedules/${id}`, data).then(r => r.data)
  },

  delete(id: string): Promise<void> {
    return api.delete(`/schedules/${id}`).then(() => undefined)
  },

  trigger(id: string): Promise<{ _id: string }> {
    return api.post<{ _id: string }>(`/schedules/${id}/trigger`).then(r => r.data)
  },
}
