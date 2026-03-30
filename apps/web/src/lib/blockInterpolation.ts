import type { ReusableBlockParameter, TestStep } from '@test-studio/shared-types'

const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g

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

function interpolateTemplate(value: string, variables: Record<string, string>): string {
  return value.replace(PLACEHOLDER_PATTERN, (_, key) => {
    if (key in variables) {
      return variables[key]
    }

    throw new Error(`Variável não encontrada: {{${key}}}`)
  })
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

export function interpolateStepsWithVariables(steps: TestStep[], variables: Record<string, string>): TestStep[] {
  return steps.map(step => ({
    ...step,
    selector: step.selector ? interpolateTemplate(step.selector, variables) : undefined,
    selectorAlternatives: step.selectorAlternatives?.map(selector => interpolateTemplate(selector, variables)),
    value: step.value ? interpolateTemplate(step.value, variables) : undefined,
    description: step.description ? interpolateTemplate(step.description, variables) : undefined,
    api: step.api
      ? {
          urlContains: interpolateTemplate(step.api.urlContains, variables),
          method: step.api.method ? interpolateTemplate(step.api.method, variables) : undefined,
          status: step.api.status,
          responseIncludes: step.api.responseIncludes ? interpolateTemplate(step.api.responseIncludes, variables) : undefined,
        }
      : undefined,
  }))
}
