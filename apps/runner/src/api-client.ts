import type { StepResult, RunStatus } from '@test-studio/shared-types'

const API_URL = process.env.API_URL ?? 'http://localhost:3001'

export async function postResult(
  runId: string,
  result: {
    status: RunStatus
    stepResults: StepResult[]
    durationMs: number
    videoPath?: string
    error?: string
  }
): Promise<void> {
  const response = await fetch(`${API_URL}/test-runs/${runId}/result`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  })

  if (!response.ok) {
    throw new Error(`Falha ao postar resultado: ${response.status}`)
  }
}
