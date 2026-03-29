---
name: test-studio-runner
description: Skill focada no runner Playwright e compilador JSON→código do Test Studio. Use para implementar execução de cenários, captura de artefatos, compilação de steps e integração entre runner e API. Acione o agent playwright-engineer para executar.
---

# Skill: test-studio-runner

Quando esta skill for acionada, você age como especialista em execução de testes do Test Studio. Seu foco é `/apps/runner` e `/packages/test-compiler`.

## Fluxo completo de execução

```
API recebe POST /test-runs/execute
  → Cria testRun no MongoDB (status: "running")
  → Chama runner com { runId, caseId, environmentId, datasetId }
    → Runner busca dados na API
    → Interpolator substitui {{variavel}} com dataset + environment.variables
    → Compiler gera código Playwright
    → Executor abre browser e roda steps
    → Cada step: captura status, duração, erro, screenshot (se falhou)
    → Artefatos salvos em /artifacts/{runId}/
    → Runner chama PATCH /test-runs/{runId} com resultado
  → API atualiza testRun (status: "passed" | "failed")
```

## Compilador: padrão de implementação

```typescript
// /packages/test-compiler/src/compiler.ts
import type { TestStep } from '@test-studio/shared-types'

export function compileStep(step: TestStep): string {
  switch (step.type) {
    case 'visit':
      return `await page.goto(${JSON.stringify(step.value)});`

    case 'click':
      return `await page.click(${JSON.stringify(step.selector)});`

    case 'fill':
      return `await page.fill(${JSON.stringify(step.selector)}, ${JSON.stringify(step.value)});`

    case 'select':
      return `await page.selectOption(${JSON.stringify(step.selector)}, ${JSON.stringify(step.value)});`

    case 'check':
      return `await page.check(${JSON.stringify(step.selector)});`

    case 'waitForVisible':
      return `await page.waitForSelector(${JSON.stringify(step.selector)}, { state: 'visible' });`

    case 'waitForURL':
      return `await page.waitForURL(${JSON.stringify(step.value)});`

    case 'assertText':
      return `await expect(page.locator(${JSON.stringify(step.selector)})).toContainText(${JSON.stringify(step.value)});`

    case 'assertVisible':
      return `await expect(page.locator(${JSON.stringify(step.selector)})).toBeVisible();`

    default:
      throw new Error(`Step type desconhecido: ${(step as any).type}`)
  }
}
```

## Interpolator: substituição de variáveis

```typescript
// /packages/test-compiler/src/interpolator.ts
export function interpolate(value: string, variables: Record<string, string>): string {
  return value.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (key in variables) return variables[key]
    throw new Error(`Variável não encontrada: {{${key}}}`)
  })
}

export function interpolateStep(step: TestStep, variables: Record<string, string>): TestStep {
  return {
    ...step,
    selector: step.selector ? interpolate(step.selector, variables) : undefined,
    value: step.value ? interpolate(step.value, variables) : undefined,
  }
}
```

## Executor: captura de resultado por step

```typescript
// /apps/runner/src/executor.ts
async function executeStep(page: Page, step: TestStep, runId: string): Promise<StepResult> {
  const start = Date.now()
  let status: 'passed' | 'failed' = 'passed'
  let error: string | undefined
  let screenshotPath: string | undefined

  try {
    const code = compileStep(step)
    await eval(`(async () => { ${code} })()`)(page) // ou função direta
  } catch (err) {
    status = 'failed'
    error = String(err)
    screenshotPath = await captureScreenshot(page, runId, step.id)
  }

  return {
    stepId: step.id,
    type: step.type,
    status,
    durationMs: Date.now() - start,
    error,
    screenshotPath,
  }
}
```

## Configuração de browser

```typescript
// /apps/runner/src/runner.ts
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  baseURL: environment.baseURL,
  extraHTTPHeaders: environment.headers,
  recordVideo: { dir: `./artifacts/${runId}/videos/` },
})
const page = await context.newPage()

try {
  // executa steps
} finally {
  await context.close()
  await browser.close()
}
```

## Artefatos

```
/artifacts/
  {runId}/
    screenshots/
      {stepId}.png
    videos/
      recording.webm
    trace/
      trace.zip
```

## Checklist ao implementar

- [ ] Interpolação de variáveis antes da compilação
- [ ] Browser fechado no `finally`
- [ ] Timeout por step configurável via env
- [ ] Screenshot automático em falha
- [ ] Resultado postado de volta na API
- [ ] Erros do runner não derrubam a API

## Delegação

Acione o agent `playwright-engineer` para executar a implementação com código real.
