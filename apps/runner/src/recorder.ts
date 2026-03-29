import { chromium, expect, type Browser, type BrowserContext, type Page } from '@playwright/test'
import type { Environment, TestStep } from '@test-studio/shared-types'

type RecorderAction = 'click' | 'fill' | 'select' | 'check' | 'assertVisible' | 'assertText'

interface RecorderViewport {
  width: number
  height: number
}

interface RecorderTarget {
  selector: string
  description?: string
  text?: string
  tagName?: string
}

interface RecorderSession {
  id: string
  environment: Environment
  browser: Browser
  context: BrowserContext
  page: Page
  viewport: RecorderViewport
  cleanupTimer?: NodeJS.Timeout
}

export interface RecorderSessionState {
  sessionId: string
  currentUrl: string
  title: string
  viewport: RecorderViewport
  steps: TestStep[]
  target?: RecorderTarget
}

const STEP_TIMEOUT_MS = Number(process.env.STEP_TIMEOUT_MS ?? 10_000)
const SESSION_TTL_MS = 15 * 60 * 1000
const VIEWPORT: RecorderViewport = { width: 1440, height: 900 }
const sessions = new Map<string, RecorderSession>()

export async function createRecorderSession(input: {
  environment: Environment
  startPath?: string
}): Promise<RecorderSessionState> {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: VIEWPORT,
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: input.environment.headers ?? {},
  })

  const page = await context.newPage()
  page.setDefaultTimeout(STEP_TIMEOUT_MS)

  const session: RecorderSession = {
    id: crypto.randomUUID(),
    environment: input.environment,
    browser,
    context,
    page,
    viewport: VIEWPORT,
  }

  sessions.set(session.id, session)
  touchSession(session)

  try {
    const startUrl = resolveTargetUrl(input.environment.baseURL, input.startPath ?? '/')
    await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT_MS })
    await settlePage(page)

    return await buildSessionState(session, [
      buildStep({
        type: 'visit',
        value: toDisplayUrl(page.url(), input.environment),
      }),
    ])
  } catch (error) {
    await disposeSession(session)
    throw error
  }
}

export async function getRecorderSessionState(sessionId: string): Promise<RecorderSessionState> {
  const session = getSession(sessionId)
  return await buildSessionState(session)
}

export async function getRecorderScreenshot(sessionId: string): Promise<Buffer> {
  const session = getSession(sessionId)
  touchSession(session)
  return session.page.screenshot({ type: 'png' })
}

export async function navigateRecorderSession(
  sessionId: string,
  target: string
): Promise<RecorderSessionState> {
  const session = getSession(sessionId)
  const targetUrl = resolveTargetUrl(session.environment.baseURL, target)

  await session.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT_MS })
  await settlePage(session.page)

  return await buildSessionState(session, [
    buildStep({
      type: 'visit',
      value: toDisplayUrl(session.page.url(), session.environment),
    }),
  ])
}

export async function interactRecorderSession(input: {
  sessionId: string
  action: RecorderAction
  x: number
  y: number
  value?: string
}): Promise<RecorderSessionState> {
  const session = getSession(input.sessionId)
  touchSession(session)

  const beforeUrl = toDisplayUrl(session.page.url(), session.environment)
  const target = await resolveTarget(session.page, input.x, input.y, input.action)

  if (!target?.selector) {
    throw new Error('Nenhum elemento válido foi encontrado nesse ponto do preview.')
  }

  const steps: TestStep[] = []

  switch (input.action) {
    case 'click':
      await session.page.mouse.click(input.x, input.y)
      steps.push(
        buildStep({
          type: 'click',
          selector: target.selector,
          description: target.description,
        })
      )
      break
    case 'fill':
      ensureActionValue(input.action, input.value)
      await session.page.locator(target.selector).first().fill(input.value, { timeout: STEP_TIMEOUT_MS })
      steps.push(
        buildStep({
          type: 'fill',
          selector: target.selector,
          value: input.value,
          description: target.description,
        })
      )
      break
    case 'select':
      ensureActionValue(input.action, input.value)
      await session.page.locator(target.selector).first().selectOption(input.value, { timeout: STEP_TIMEOUT_MS })
      steps.push(
        buildStep({
          type: 'select',
          selector: target.selector,
          value: input.value,
          description: target.description,
        })
      )
      break
    case 'check':
      await session.page.locator(target.selector).first().check({ timeout: STEP_TIMEOUT_MS })
      steps.push(
        buildStep({
          type: 'check',
          selector: target.selector,
          description: target.description,
        })
      )
      break
    case 'assertVisible':
      await expect(session.page.locator(target.selector).first()).toBeVisible({ timeout: STEP_TIMEOUT_MS })
      steps.push(
        buildStep({
          type: 'assertVisible',
          selector: target.selector,
          description: target.description,
        })
      )
      break
    case 'assertText': {
      const text = input.value?.trim() || target.text?.trim()
      if (!text) {
        throw new Error('Informe um texto esperado ou clique em um elemento que tenha texto visível.')
      }

      await expect(session.page.locator(target.selector).first()).toContainText(text, { timeout: STEP_TIMEOUT_MS })
      steps.push(
        buildStep({
          type: 'assertText',
          selector: target.selector,
          value: text,
          description: target.description,
        })
      )
      break
    }
    default:
      throw new Error(`Ação de recorder não suportada: ${input.action}`)
  }

  await settlePage(session.page)

  const afterUrl = toDisplayUrl(session.page.url(), session.environment)
  if (afterUrl !== beforeUrl) {
    steps.push(
      buildStep({
        type: 'waitForURL',
        value: afterUrl,
      })
    )
  }

  return await buildSessionState(session, steps, target)
}

export async function closeRecorderSession(sessionId: string): Promise<void> {
  const session = getSession(sessionId)
  await disposeSession(session)
}

function getSession(sessionId: string): RecorderSession {
  const session = sessions.get(sessionId)
  if (!session) {
    throw new Error('Sessão do recorder não encontrada ou já encerrada.')
  }

  touchSession(session)
  return session
}

function touchSession(session: RecorderSession): void {
  if (session.cleanupTimer) {
    clearTimeout(session.cleanupTimer)
  }

  session.cleanupTimer = setTimeout(() => {
    disposeSession(session).catch(error => {
      console.error(`Erro ao limpar sessão do recorder ${session.id}:`, error)
    })
  }, SESSION_TTL_MS)
}

async function disposeSession(session: RecorderSession): Promise<void> {
  if (session.cleanupTimer) {
    clearTimeout(session.cleanupTimer)
  }

  sessions.delete(session.id)

  await session.context.close().catch(() => undefined)
  await session.browser.close().catch(() => undefined)
}

async function settlePage(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded', { timeout: STEP_TIMEOUT_MS }).catch(() => undefined)
  await page.waitForLoadState('networkidle', { timeout: 1_500 }).catch(() => undefined)
}

function resolveTargetUrl(baseURL: string, target: string): string {
  return new URL(target, baseURL).toString()
}

function toDisplayUrl(rawUrl: string, environment: Environment): string {
  try {
    const current = new URL(rawUrl)
    const base = new URL(environment.baseURL)

    if (current.origin === base.origin) {
      return `${current.pathname}${current.search}${current.hash}` || '/'
    }
  } catch {
    return rawUrl
  }

  return rawUrl
}

function buildStep(step: Omit<TestStep, 'id'>): TestStep {
  return {
    id: crypto.randomUUID(),
    ...step,
  }
}

async function buildSessionState(
  session: RecorderSession,
  steps: TestStep[] = [],
  target?: RecorderTarget
): Promise<RecorderSessionState> {
  touchSession(session)

  return {
    sessionId: session.id,
    currentUrl: toDisplayUrl(session.page.url(), session.environment),
    title: session.page.url() ? await session.page.title().catch(() => '') : '',
    viewport: session.viewport,
    steps,
    target,
  }
}

function ensureActionValue(action: 'fill' | 'select', value?: string): asserts value is string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Informe um valor antes de usar a ação "${action}".`)
  }
}

async function resolveTarget(page: Page, x: number, y: number, action: RecorderAction): Promise<RecorderTarget | null> {
  return page.evaluate(({ x, y, action }) => {
    function escapeAttribute(value: string): string {
      return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    }

    function nthIndex(element: Element): number {
      let index = 1
      let sibling = element.previousElementSibling

      while (sibling) {
        if (sibling.tagName === element.tagName) {
          index += 1
        }
        sibling = sibling.previousElementSibling
      }

      return index
    }

    function buildFallbackSelector(element: Element): string {
      const parts: string[] = []
      let current: Element | null = element

      while (current && current.nodeType === Node.ELEMENT_NODE && current.tagName.toLowerCase() !== 'html') {
        const tagName = current.tagName.toLowerCase()
        parts.unshift(`${tagName}:nth-of-type(${nthIndex(current)})`)

        if (current.getAttribute('data-testid') || current.id) {
          break
        }

        current = current.parentElement
      }

      return parts.join(' > ')
    }

    function buildSelector(element: Element): string {
      const testId = element.getAttribute('data-testid')
      if (testId) {
        return `[data-testid="${escapeAttribute(testId)}"]`
      }

      const id = element.getAttribute('id')
      if (id) {
        return `[id="${escapeAttribute(id)}"]`
      }

      const name = element.getAttribute('name')
      if (name) {
        return `${element.tagName.toLowerCase()}[name="${escapeAttribute(name)}"]`
      }

      const ariaLabel = element.getAttribute('aria-label')
      if (ariaLabel) {
        return `${element.tagName.toLowerCase()}[aria-label="${escapeAttribute(ariaLabel)}"]`
      }

      return buildFallbackSelector(element)
    }

    function isVisible(element: Element): boolean {
      const rect = element.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    }

    function actionSelector(currentAction: string): string {
      switch (currentAction) {
        case 'fill':
          return 'input:not([type="hidden"]), textarea, [contenteditable="true"], [contenteditable=""], [contenteditable]'
        case 'select':
          return 'select'
        case 'check':
          return 'input[type="checkbox"], input[type="radio"]'
        case 'click':
          return 'button, a, input, textarea, select, label, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [data-testid]'
        default:
          return 'input, textarea, select, button, a, label, [role], [data-testid]'
      }
    }

    function chooseClosestDescendant(root: Element, selector: string): Element | null {
      const candidates = Array.from(root.querySelectorAll(selector)).filter(isVisible)
      if (candidates.length === 0) {
        return null
      }

      candidates.sort((left, right) => {
        const leftRect = left.getBoundingClientRect()
        const rightRect = right.getBoundingClientRect()
        const leftDistance = Math.hypot(leftRect.x + leftRect.width / 2 - x, leftRect.y + leftRect.height / 2 - y)
        const rightDistance = Math.hypot(rightRect.x + rightRect.width / 2 - x, rightRect.y + rightRect.height / 2 - y)
        return leftDistance - rightDistance
      })

      return candidates[0] ?? null
    }

    function resolveElement(element: Element | null, currentAction: string): Element | null {
      if (!element) {
        return null
      }

      const preferredSelector = actionSelector(currentAction)
      const stack = document.elementsFromPoint(x, y)

      for (const candidate of stack) {
        if (candidate.matches(preferredSelector) && isVisible(candidate)) {
          return candidate
        }

        if (candidate instanceof HTMLLabelElement && candidate.control && candidate.control.matches(preferredSelector)) {
          return candidate.control
        }
      }

      for (const candidate of stack) {
        const descendant = chooseClosestDescendant(candidate, preferredSelector)
        if (descendant) {
          return descendant
        }
      }

      if (element instanceof HTMLLabelElement && element.control) {
        return element.control
      }

      const closestPreferred = element.closest(preferredSelector)
      if (closestPreferred && isVisible(closestPreferred)) {
        return closestPreferred
      }

      const genericControl = element.closest('input, textarea, select, button, a, label, [role], [data-testid]')
      if (genericControl && isVisible(genericControl)) {
        return genericControl
      }

      return element
    }

    const rawElement = document.elementFromPoint(x, y)
    const element = resolveElement(rawElement, action)

    if (!element) {
      return null
    }

    const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim()

    return {
      selector: buildSelector(element),
      description: text || undefined,
      text: text || undefined,
      tagName: element.tagName.toLowerCase(),
    }
  }, { x, y, action })
}
