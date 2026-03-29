import type { TestStep } from '@test-studio/shared-types'

export function interpolate(value: string, variables: Record<string, string>): string {
  return value.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (key in variables) return variables[key]
    throw new Error(`Variável não encontrada no dataset: {{${key}}}`)
  })
}

export function interpolateStep(step: TestStep, variables: Record<string, string>): TestStep {
  return {
    ...step,
    selector: step.selector ? interpolate(step.selector, variables) : undefined,
    value: step.value ? interpolate(step.value, variables) : undefined,
  }
}

export function interpolateSteps(steps: TestStep[], variables: Record<string, string>): TestStep[] {
  return steps.map(step => interpolateStep(step, variables))
}
