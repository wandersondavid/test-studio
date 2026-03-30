import { ScheduleModel, ISchedule } from '../models/Schedule.js'
import type { AuditActor } from '@test-studio/shared-types'

export interface CreateScheduleData {
  name: string
  cron: string
  caseId: string
  environmentId: string
  datasetId?: string
  isActive?: boolean
  createdBy?: AuditActor
}

export interface UpdateScheduleData {
  name?: string
  cron?: string
  caseId?: string
  environmentId?: string
  datasetId?: string
  isActive?: boolean
}

export class ScheduleService {
  async find(): Promise<ISchedule[]> {
    return ScheduleModel.find().sort({ createdAt: -1 })
  }

  async findById(id: string): Promise<ISchedule | null> {
    return ScheduleModel.findById(id)
  }

  async findAllActive(): Promise<ISchedule[]> {
    return ScheduleModel.find({ isActive: true })
  }

  async create(data: CreateScheduleData): Promise<ISchedule> {
    return ScheduleModel.create(data)
  }

  async update(id: string, data: UpdateScheduleData): Promise<ISchedule | null> {
    return ScheduleModel.findByIdAndUpdate(id, data, { new: true })
  }

  async remove(id: string): Promise<ISchedule | null> {
    return ScheduleModel.findByIdAndDelete(id)
  }

  async updateLastRun(id: string): Promise<void> {
    await ScheduleModel.findByIdAndUpdate(id, { lastRunAt: new Date() })
  }
}
