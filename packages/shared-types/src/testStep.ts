export type StepType =
  | 'visit'
  | 'click'
  | 'fill'
  | 'select'
  | 'check'
  | 'waitForVisible'
  | 'waitForURL'
  | 'assertText'
  | 'assertVisible'

export interface StepRetryConfig {
  attempts: number
  intervalMs: number
}

export interface TestStep {
  id: string
  type: StepType
  selector?: string
  value?: string
  description?: string
  timeoutMs?: number
  retry?: StepRetryConfig
}
