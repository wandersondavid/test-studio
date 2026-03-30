import type { TestStep } from '@test-studio/shared-types'

function escapeStr(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function stepToCode(step: TestStep, baseURL: string, index: number): string {
  const label = step.description ?? step.type
  const comment = `  // Step ${index}: ${label}`

  switch (step.type) {
    case 'visit': {
      const url = `${baseURL}${step.value ?? ''}`
      return `${comment}\n  await page.goto('${escapeStr(url)}');`
    }
    case 'click':
      return `${comment}\n  await page.locator('${escapeStr(step.selector ?? '')}').click();`
    case 'fill':
      return `${comment}\n  await page.locator('${escapeStr(step.selector ?? '')}').fill('${escapeStr(step.value ?? '')}');`
    case 'select':
      return `${comment}\n  await page.locator('${escapeStr(step.selector ?? '')}').selectOption('${escapeStr(step.value ?? '')}');`
    case 'check':
      return `${comment}\n  await page.locator('${escapeStr(step.selector ?? '')}').check();`
    case 'waitForVisible':
      return `${comment}\n  await page.locator('${escapeStr(step.selector ?? '')}').waitFor({ state: 'visible' });`
    case 'waitForURL':
      return `${comment}\n  await page.waitForURL('${escapeStr(step.value ?? '')}');`
    case 'waitForApi': {
      const urlContains = escapeStr(step.api?.urlContains ?? '')
      const status = typeof step.api?.status === 'number' ? step.api.status : 200
      return `${comment}\n  await page.waitForResponse(resp => resp.url().includes('${urlContains}') && resp.status() === ${status});`
    }
    case 'assertText':
      return `${comment}\n  await expect(page.locator('${escapeStr(step.selector ?? '')}')).toContainText('${escapeStr(step.value ?? '')}');`
    case 'assertVisible':
      return `${comment}\n  await expect(page.locator('${escapeStr(step.selector ?? '')}')).toBeVisible();`
    default:
      return `  // Step ${index}: unknown type "${(step as TestStep).type}" — skipped`
  }
}

export function generateSpecFile(options: {
  caseName: string
  steps: TestStep[]
  envName?: string
  baseURL?: string
}): string {
  const { caseName, steps, envName, baseURL = '' } = options

  const envComment = envName
    ? `  // Environment: ${envName} (${baseURL})\n`
    : ''

  const stepLines = steps
    .map((step, i) => stepToCode(step, baseURL, i + 1))
    .join('\n\n')

  return [
    `import { test, expect } from '@playwright/test';`,
    ``,
    `test('${escapeStr(caseName)}', async ({ page }) => {`,
    envComment + stepLines,
    `});`,
    ``,
  ].join('\n')
}
