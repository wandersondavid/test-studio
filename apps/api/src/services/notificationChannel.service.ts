import { NotificationChannel, INotificationChannel } from '../models/NotificationChannel.js'
import type { ITestRun } from '../models/TestRun.js'

export class NotificationChannelService {
  async findAll(): Promise<INotificationChannel[]> {
    return NotificationChannel.find().sort({ createdAt: -1 })
  }

  async findById(id: string): Promise<INotificationChannel | null> {
    return NotificationChannel.findById(id)
  }

  async findActive(): Promise<INotificationChannel[]> {
    return NotificationChannel.find({ isActive: true })
  }

  async create(data: Partial<INotificationChannel>): Promise<INotificationChannel> {
    return NotificationChannel.create(data)
  }

  async update(id: string, data: Partial<INotificationChannel>): Promise<INotificationChannel | null> {
    return NotificationChannel.findByIdAndUpdate(id, data, { new: true })
  }

  async delete(id: string): Promise<void> {
    await NotificationChannel.findByIdAndDelete(id)
  }
}

function buildEventForStatus(status: ITestRun['status']): Array<'on_pass' | 'on_fail' | 'always'> {
  if (status === 'passed') return ['on_pass', 'always']
  if (status === 'failed' || status === 'error') return ['on_fail', 'always']
  return []
}

function buildSlackPayload(run: ITestRun, caseName: string): Record<string, unknown> {
  const statusEmoji = run.status === 'passed' ? '✅' : run.status === 'failed' ? '❌' : '⚠️'
  const duration = run.durationMs != null ? `${run.durationMs}ms` : 'N/A'
  return {
    text: `${statusEmoji} Test Run *${run.status.toUpperCase()}*: ${caseName} — environment \`${run.environmentId}\` — ${duration}`,
  }
}

function buildWebhookPayload(run: ITestRun, caseName: string): Record<string, unknown> {
  return {
    runId: run.id as string,
    status: run.status,
    caseName,
    environmentId: run.environmentId,
    durationMs: run.durationMs ?? null,
    error: run.error ?? null,
  }
}

export async function sendNotification(run: ITestRun, channels: INotificationChannel[], caseName: string): Promise<void> {
  const matchingEvents = buildEventForStatus(run.status)

  const activeMatching = channels.filter(
    ch => ch.isActive && ch.events.some(ev => matchingEvents.includes(ev))
  )

  await Promise.allSettled(
    activeMatching.map(async channel => {
      try {
        const body = channel.type === 'slack'
          ? buildSlackPayload(run, caseName)
          : buildWebhookPayload(run, caseName)

        await fetch(channel.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } catch (err) {
        console.error(`[notifications] Failed to send to channel "${channel.name}" (${channel.url}):`, err)
      }
    })
  )
}
