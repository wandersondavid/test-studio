import type { AuditActor } from './audit'

export interface Schedule {
  _id: string
  name: string
  cron: string
  caseId: string
  environmentId: string
  datasetId?: string
  isActive: boolean
  lastRunAt?: string
  nextRunAt?: string
  createdBy?: AuditActor
  createdAt: string
  updatedAt: string
}

export interface CreateScheduleInput {
  name: string
  cron: string
  caseId: string
  environmentId: string
  datasetId?: string
  isActive?: boolean
}

export interface UpdateScheduleInput {
  name?: string
  cron?: string
  caseId?: string
  environmentId?: string
  datasetId?: string
  isActive?: boolean
}
