import type { TestStep } from '@test-studio/shared-types'

export function compileStep(step: TestStep): string {
  const sel = step.selector ? JSON.stringify(step.selector) : 'undefined'
  const val = step.value ? JSON.stringify(step.value) : 'undefined'
  const timeout = step.timeoutMs ?? 10000

  switch (step.type) {
    case 'visit':
      return `await page.goto(${val});`

    case 'click':
      return `await page.click(${sel}, { timeout: ${timeout} });`

    case 'fill':
      return `await page.fill(${sel}, ${val}, { timeout: ${timeout} });`

    case 'select':
      return `await page.selectOption(${sel}, ${val}, { timeout: ${timeout} });`

    case 'check':
      return `await page.check(${sel}, { timeout: ${timeout} });`

    case 'waitForVisible':
      return `await page.waitForSelector(${sel}, { state: 'visible', timeout: ${timeout} });`

    case 'waitForURL':
      return `await page.waitForURL(${val}, { timeout: ${timeout} });`

    case 'assertText':
      return `await expect(page.locator(${sel})).toContainText(${val});`

    case 'assertVisible':
      return `await expect(page.locator(${sel})).toBeVisible({ timeout: ${timeout} });`

    default:
      throw new Error(`Step type desconhecido: ${(step as TestStep).type}`)
  }
}

export function compileSteps(steps: TestStep[]): string {
  return steps.map(compileStep).join('\n')
}
