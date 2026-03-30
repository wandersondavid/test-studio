import type { StepResult, RunStatus, ConsoleLogEntry, NetworkLogEntry } from '@test-studio/shared-types'

const API_URL = process.env.API_URL ?? 'http://localhost:3001'
const RUNNER_SHARED_SECRET = process.env.RUNNER_SHARED_SECRET ?? 'test-studio-runner-secret'

export async function postResult(
  runId: string,
  result: {
    status: RunStatus
    stepResults: StepResult[]
    consoleLogs?: ConsoleLogEntry[]
    networkLogs?: NetworkLogEntry[]
    durationMs: number
    videoPath?: string
    error?: string
  }
): Promise<void> {
  const response = await fetch(`${API_URL}/test-runs/${runId}/result`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-runner-secret': RUNNER_SHARED_SECRET,
    },
    body: JSON.stringify(result),
  })

  if (!response.ok) {
    throw new Error(`Falha ao postar resultado: ${response.status}`)
  }
}
