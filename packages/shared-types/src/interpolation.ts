import type { ReusableBlockParameter } from './reusableBlock'
import type { TestStep } from './testStep'

const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g

export function interpolateTemplate(value: string, variables: Record<string, string>): string {
  return value.replace(PLACEHOLDER_PATTERN, (_, key) => {
    if (key in variables) {
      return variables[key]
    }

    throw new Error(`Variável não encontrada: {{${key}}}`)
  })
}

export function interpolateOptionalTemplate(
  value: string | undefined,
  variables: Record<string, string>
): string | undefined {
  return value ? interpolateTemplate(value, variables) : undefined
}

export function collectTemplateVariables(steps: TestStep[]): string[] {
  const found = new Set<string>()
  const textParts: string[] = []

  for (const step of steps) {
    textParts.push(step.selector ?? '')
    textParts.push(...(step.selectorAlternatives ?? []))
    textParts.push(step.value ?? '')
    textParts.push(step.description ?? '')
    textParts.push(step.api?.urlContains ?? '')
    textParts.push(step.api?.method ?? '')
    textParts.push(step.api?.responseIncludes ?? '')
  }

  for (const part of textParts) {
    for (const match of part.matchAll(PLACEHOLDER_PATTERN)) {
      if (match[1]) {
        found.add(match[1])
      }
    }
  }

  return [...found]
}

export function buildParameterValueMap(
  parameters: Array<ReusableBlockParameter | { key: string; defaultValue?: string }>,
  values: Record<string, string | undefined>
): Record<string, string> {
  const resolved: Record<string, string> = {}

  for (const parameter of parameters) {
    const provided = values[parameter.key]
    const nextValue = provided ?? parameter.defaultValue

    if (typeof nextValue === 'string') {
      resolved[parameter.key] = nextValue
    }
  }

  return resolved
}

export function interpolateStepWithVariables(step: TestStep, variables: Record<string, string>): TestStep {
  return {
    ...step,
    selector: interpolateOptionalTemplate(step.selector, variables),
    selectorAlternatives: step.selectorAlternatives?.map(selector => interpolateTemplate(selector, variables)),
    value: interpolateOptionalTemplate(step.value, variables),
    description: interpolateOptionalTemplate(step.description, variables),
    api: step.api
      ? {
          urlContains: interpolateTemplate(step.api.urlContains, variables),
          method: interpolateOptionalTemplate(step.api.method, variables),
          status: step.api.status,
          responseIncludes: interpolateOptionalTemplate(step.api.responseIncludes, variables),
        }
      : undefined,
  }
}

export function interpolateStepsWithVariables(steps: TestStep[], variables: Record<string, string>): TestStep[] {
  return steps.map(step => interpolateStepWithVariables(step, variables))
}
