import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import type { TestStep, StepType } from '@test-studio/shared-types'

export const aiRouter = Router()

const generateStepsSchema = z.object({
  description: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres.').max(2000, 'A descrição deve ter no máximo 2000 caracteres.'),
  baseURL: z.string().optional(),
})

const VALID_STEP_TYPES: StepType[] = [
  'visit', 'click', 'fill', 'select', 'check',
  'waitForVisible', 'waitForURL', 'assertText', 'assertVisible', 'waitForApi',
]

const SYSTEM_PROMPT = `You are a Playwright test automation expert. Given a plain-text description of a test scenario, generate a JSON array of test steps.

Return ONLY valid JSON with this exact structure:
{
  "steps": [
    {
      "id": "<uuid-like string e.g. step_1>",
      "type": "<one of: visit|click|fill|select|check|waitForVisible|waitForURL|assertText|assertVisible|waitForApi>",
      "selector": "<CSS selector or data-testid e.g. [data-testid='login-btn'] — omit for visit/waitForURL>",
      "value": "<value for fill/select — omit for others>",
      "description": "<brief human label>"
    }
  ]
}

Rules:
- Prefer data-testid selectors like [data-testid="submit"]
- For login forms: use fill for email/password, then click submit
- For navigation: use visit with the path (e.g. /login)
- Keep steps minimal and focused
- Use assertText or assertVisible for verifications
- Maximum 15 steps
- All fields except id, type, description are optional when not needed`

function generateStepId(): string {
  return 'step_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
}

interface RawStep {
  id?: unknown
  type?: unknown
  selector?: unknown
  value?: unknown
  description?: unknown
}

function parseAndValidateSteps(raw: unknown): TestStep[] {
  if (!Array.isArray(raw)) throw new Error('Expected steps to be an array')

  return raw
    .filter((s: RawStep) => s && typeof s.type === 'string' && VALID_STEP_TYPES.includes(s.type as StepType))
    .map((s: RawStep) => {
      const step: TestStep = {
        id: generateStepId(),
        type: s.type as StepType,
      }
      if (typeof s.selector === 'string' && s.selector) step.selector = s.selector
      if (typeof s.value === 'string' && s.value) step.value = s.value
      if (typeof s.description === 'string' && s.description) step.description = s.description
      return step
    })
}

aiRouter.post('/generate-steps', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const openaiKey = process.env.OPENAI_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY

    if (!openaiKey && !anthropicKey) {
      res.status(400).json({ error: 'AI feature not configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.' })
      return
    }

    const { description, baseURL } = generateStepsSchema.parse(req.body)

    let rawSteps: unknown

    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Test description: ${description}\nBase URL: ${baseURL ?? ''}` },
          ],
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`OpenAI API error ${response.status}: ${errText}`)
      }

      const data = await response.json() as { choices: Array<{ message: { content: string } }> }
      const parsed = JSON.parse(data.choices[0].message.content) as { steps: unknown }
      rawSteps = parsed.steps
    } else {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey!,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: SYSTEM_PROMPT + '\n\nTest description: ' + description + '\nBase URL: ' + (baseURL ?? ''),
            },
          ],
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Anthropic API error ${response.status}: ${errText}`)
      }

      const data = await response.json() as { content: Array<{ text: string }> }
      const parsed = JSON.parse(data.content[0].text) as { steps: unknown }
      rawSteps = parsed.steps
    }

    const steps = parseAndValidateSteps(rawSteps)

    if (steps.length === 0) {
      throw new Error('AI returned no valid steps')
    }

    res.json({ steps })
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(err)
      return
    }
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: 'AI generation failed', details: message })
  }
})
