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

export interface TestStep {
  id: string
  type: StepType
  selector?: string
  value?: string
  description?: string
  timeoutMs?: number
}
