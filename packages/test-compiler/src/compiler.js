"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileStep = compileStep;
exports.compileSteps = compileSteps;
function buildSelectorCandidates(step) {
    return [...new Set([step.selector, ...(step.selectorAlternatives ?? [])].filter(Boolean))];
}
function buildSelectorResolver(step, timeout) {
    const candidates = buildSelectorCandidates(step);
    const serializedCandidates = JSON.stringify(candidates);
    return `
const __selectorCandidates = ${serializedCandidates};
const __resolveLocator = async () => {
  let __lastSelectorError;
  for (const __candidate of __selectorCandidates) {
    try {
      const __locator = page.locator(__candidate).first();
      const __count = await __locator.count();
      if (__count === 0) {
        continue;
      }
      await __locator.waitFor({ state: 'attached', timeout: Math.min(${timeout}, 1500) }).catch(() => undefined);
      return { locator: __locator, selector: __candidate };
    } catch (__error) {
      __lastSelectorError = __error;
    }
  }

  const __selectorList = __selectorCandidates.join(', ');
  const __selectorMessage = __lastSelectorError instanceof Error ? __lastSelectorError.message : '';
  throw new Error(\`Nenhum seletor conseguiu localizar o elemento. Tentados: \${__selectorList}\${__selectorMessage ? ' | Ultimo erro: ' + __selectorMessage : ''}\`);
};
const { locator: __locator, selector: __resolvedSelector } = await __resolveLocator();
void __resolvedSelector;
`.trim();
}
function compileStepBody(step, timeout, val) {
    switch (step.type) {
        case 'visit':
            return `await page.goto(${val});`;
        case 'click':
            return `await __locator.click({ timeout: ${timeout} });`;
        case 'fill':
            return `await __locator.fill(${val}, { timeout: ${timeout} });`;
        case 'select':
            return `await __locator.selectOption(${val}, { timeout: ${timeout} });`;
        case 'check':
            return `await __locator.check({ timeout: ${timeout} });`;
        case 'waitForVisible':
            return `await __locator.waitFor({ state: 'visible', timeout: ${timeout} });`;
        case 'waitForURL':
            return `await page.waitForURL(${val}, { timeout: ${timeout} });`;
        case 'waitForApi': {
            const urlContains = JSON.stringify(step.api?.urlContains ?? '');
            const method = step.api?.method ? JSON.stringify(step.api.method.toUpperCase()) : 'undefined';
            const status = typeof step.api?.status === 'number' ? String(step.api.status) : 'undefined';
            const responseIncludes = step.api?.responseIncludes ? JSON.stringify(step.api.responseIncludes) : 'undefined';
            return `
await page.waitForResponse(async response => {
  if (!response.url().includes(${urlContains})) return false;
  if (${method} && response.request().method().toUpperCase() !== ${method}) return false;
  if (typeof ${status} === 'number' && response.status() !== ${status}) return false;
  if (${responseIncludes}) {
    const __body = await response.text().catch(() => '');
    return __body.includes(${responseIncludes});
  }
  return true;
}, { timeout: ${timeout} });
`.trim();
        }
        case 'assertText':
            return `await expect(__locator).toContainText(${val}, { timeout: ${timeout} });`;
        case 'assertVisible':
            return `await expect(__locator).toBeVisible({ timeout: ${timeout} });`;
        default:
            throw new Error(`Step type desconhecido: ${step.type}`);
    }
}
function compileStep(step) {
    const val = step.value ? JSON.stringify(step.value) : 'undefined';
    const timeout = step.timeoutMs ?? 10000;
    const needsSelector = !['visit', 'waitForURL', 'waitForApi'].includes(step.type);
    const selectorResolver = needsSelector ? `${buildSelectorResolver(step, timeout)}\n` : '';
    const body = compileStepBody(step, timeout, val);
    const code = `${selectorResolver}${body}`;
    if (step.retry && step.retry.attempts > 1) {
        const attempts = step.retry.attempts;
        const intervalMs = step.retry.intervalMs;
        return `
let __lastError;
for (let __attempt = 1; __attempt <= ${attempts}; __attempt += 1) {
  try {
    ${code}
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
}`.trim();
    }
    return code;
}
function compileSteps(steps) {
    return steps.map(compileStep).join('\n');
}
//# sourceMappingURL=compiler.js.map