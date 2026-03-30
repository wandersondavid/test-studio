import cron from 'node-cron'
import { ScheduleModel } from '../models/Schedule.js'
import { TestRun } from '../models/TestRun.js'
import { getRunnerSharedSecret } from '../utils/auth.js'
import type { ISchedule } from '../models/Schedule.js'

const tasks = new Map<string, cron.ScheduledTask>()

export async function startScheduler(): Promise<void> {
  console.log('[scheduler] Starting scheduler...')
  try {
    const schedules = await ScheduleModel.find({ isActive: true })
    for (const schedule of schedules) {
      registerTask(schedule)
    }
    console.log(`[scheduler] Registered ${schedules.length} schedules`)
  } catch (err) {
    console.error('[scheduler] Failed to start scheduler:', err)
  }
}

export function registerTask(schedule: ISchedule): void {
  const id = (schedule._id as { toString(): string }).toString()

  if (tasks.has(id)) {
    tasks.get(id)!.stop()
    tasks.delete(id)
  }

  if (!schedule.isActive) return

  if (!cron.validate(schedule.cron)) {
    console.warn(`[scheduler] Invalid cron expression for schedule "${schedule.name}": ${schedule.cron}`)
    return
  }

  const task = cron.schedule(schedule.cron, async () => {
    await executeScheduledRun(schedule)
  })

  tasks.set(id, task)
}

export function unregisterTask(scheduleId: string): void {
  if (tasks.has(scheduleId)) {
    tasks.get(scheduleId)!.stop()
    tasks.delete(scheduleId)
  }
}

async function executeScheduledRun(schedule: ISchedule): Promise<void> {
  try {
    const caseId = schedule.caseId?.toString()
    const environmentId = schedule.environmentId?.toString()

    if (!caseId || !environmentId) {
      console.error(`[scheduler] Schedule "${schedule.name}" is missing caseId or environmentId — skipping`)
      return
    }

    const runnerUrl = process.env.RUNNER_URL ?? 'http://localhost:3002'

    const run = await TestRun.create({
      caseId,
      environmentId,
      datasetId: schedule.datasetId?.toString(),
      status: 'running',
      requestedVia: 'scheduled',
      requestedBy: {
        userId: 'scheduler',
        name: 'Scheduler',
        email: 'scheduler@system',
        role: 'admin',
      },
    })

    await ScheduleModel.findByIdAndUpdate(schedule._id, { lastRunAt: new Date() })

    fetch(`${runnerUrl}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-runner-secret': getRunnerSharedSecret(),
      },
      body: JSON.stringify({ runId: run._id.toString() }),
    }).catch(err => console.error('[scheduler] Runner trigger failed:', err))

    console.log(`[scheduler] Triggered run ${run._id} for schedule "${schedule.name}"`)
  } catch (err) {
    console.error(`[scheduler] Failed to execute schedule "${schedule.name}":`, err)
  }
}
