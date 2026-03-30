export type StepType =
  | 'visit'
  | 'click'
  | 'fill'
  | 'select'
  | 'check'
  | 'waitForVisible'
  | 'waitForURL'
  | 'waitForApi'
  | 'assertText'
  | 'assertVisible'

export const STEP_TYPES: readonly StepType[] = [
  'visit',
  'click',
  'fill',
  'select',
  'check',
  'waitForVisible',
  'waitForURL',
  'waitForApi',
  'assertText',
  'assertVisible',
] as const

export interface StepRetryConfig {
  attempts: number
  intervalMs: number
}

export interface StepApiCondition {
  urlContains: string
  method?: string
  status?: number
  responseIncludes?: string
}

export interface TestStep {
  id: string
  type: StepType
  selector?: string
  selectorAlternatives?: string[]
  value?: string
  description?: string
  timeoutMs?: number
  retry?: StepRetryConfig
  api?: StepApiCondition
}
