import type { TestStep } from '@test-studio/shared-types'

function compileStepBody(step: TestStep, timeout: number, sel: string, val: string): string {
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
      return `await expect(page.locator(${sel})).toContainText(${val}, { timeout: ${timeout} });`

    case 'assertVisible':
      return `await expect(page.locator(${sel})).toBeVisible({ timeout: ${timeout} });`

    default:
      throw new Error(`Step type desconhecido: ${(step as TestStep).type}`)
  }
}

export function compileStep(step: TestStep): string {
  const sel = step.selector ? JSON.stringify(step.selector) : 'undefined'
  const val = step.value ? JSON.stringify(step.value) : 'undefined'
  const timeout = step.timeoutMs ?? 10000
  const body = compileStepBody(step, timeout, sel, val)

  if (step.retry && step.retry.attempts > 1) {
    const attempts = step.retry.attempts
    const intervalMs = step.retry.intervalMs

    return `
let __lastError;
for (let __attempt = 1; __attempt <= ${attempts}; __attempt += 1) {
  try {
    ${body}
    __lastError = undefined;
    break;
  } catch (__error) {
    __lastError = __error;
    if (__attempt === ${attempts}) {
      const __message = __lastError instanceof Error ? __lastError.message : String(__lastError);
      throw new Error(\`Falhou apos ${attempts} tentativas com intervalo de ${intervalMs}ms. Ultimo erro: \${__message}\`);
    }
    await page.waitForTimeout(${intervalMs});
  }
}`.trim()
  }

  return body
}

export function compileSteps(steps: TestStep[]): string {
  return steps.map(compileStep).join('\n')
}
