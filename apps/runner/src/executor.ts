import { chromium, expect, Page } from '@playwright/test'
import { compileStep, interpolateSteps } from '@test-studio/test-compiler'
import { saveScreenshot, ensureArtifactDir, getRunVideoDir } from './artifacts.js'
import { postResult } from './api-client.js'
import type { Environment, TestCase, Dataset, StepResult } from '@test-studio/shared-types'

interface RunInput {
  runId: string
  testCase: TestCase
  environment: Environment
  dataset: Dataset | null
}

export async function runTestCase({ runId, testCase, environment, dataset }: RunInput): Promise<void> {
  await ensureArtifactDir(runId)

  const variables: Record<string, string> = {
    ...Object.fromEntries(Object.entries(environment.variables ?? {})),
    ...Object.fromEntries(Object.entries(dataset?.variables ?? {})),
  }

  const steps = interpolateSteps(testCase.steps, variables)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    baseURL: environment.baseURL,
    extraHTTPHeaders: environment.headers ?? {},
    recordVideo: { dir: getRunVideoDir(runId) },
  })
  const page = await context.newPage()

  const stepResults: StepResult[] = []
  const runStart = Date.now()

  try {
    for (const step of steps) {
      const result = await executeStep(page, step, runId)
      stepResults.push(result)

      if (result.status === 'failed') break
    }
  } finally {
    await context.close()
    await browser.close()
  }

  const allPassed = stepResults.every(r => r.status === 'passed')

  await postResult(runId, {
    status: allPassed ? 'passed' : 'failed',
    stepResults,
    durationMs: Date.now() - runStart,
  })
}

async function executeStep(
  page: Page,
  step: import('@test-studio/shared-types').TestStep,
  runId: string
): Promise<StepResult> {
  const start = Date.now()

  try {
    const code = compileStep(step)
    // eslint-disable-next-line no-new-func
    await new Function('page', 'expect', `return (async () => { ${code} })()`)(page, expect)

    return {
      stepId: step.id,
      type: step.type,
      status: 'passed',
      durationMs: Date.now() - start,
    }
  } catch (err) {
    const screenshotPath = await saveScreenshot(page, runId, step.id)

    return {
      stepId: step.id,
      type: step.type,
      status: 'failed',
      durationMs: Date.now() - start,
      error: String(err),
      screenshotPath,
    }
  }
}
