import { chromium, expect } from '@playwright/test';
import { compileStep, interpolateSteps } from '@test-studio/test-compiler';
import { saveScreenshot, ensureArtifactDir, getRunVideoDir } from './artifacts.js';
import { postResult } from './api-client.js';
export async function runTestCase({ runId, testCase, environment, dataset }) {
    await ensureArtifactDir(runId);
    const variables = {
        ...Object.fromEntries(Object.entries(environment.variables ?? {})),
        ...Object.fromEntries(Object.entries(dataset?.variables ?? {})),
    };
    const steps = interpolateSteps(testCase.steps, variables);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        baseURL: environment.baseURL,
        extraHTTPHeaders: environment.headers ?? {},
        recordVideo: { dir: getRunVideoDir(runId) },
    });
    const page = await context.newPage();
    const stepResults = [];
    const consoleLogs = [];
    const networkLogs = [];
    const runStart = Date.now();
    let currentStepId;
    const requestIds = new WeakMap();
    let nextRequestId = 1;
    page.on('console', message => {
        const text = message.text().trim();
        if (!text)
            return;
        consoleLogs.push({
            id: crypto.randomUUID(),
            stepId: currentStepId,
            type: normalizeConsoleType(message.type()),
            text,
            location: message.location().url
                ? `${message.location().url}:${message.location().lineNumber ?? 0}:${message.location().columnNumber ?? 0}`
                : undefined,
            timestamp: new Date().toISOString(),
        });
    });
    page.on('request', request => {
        const requestId = `req-${nextRequestId}`;
        nextRequestId += 1;
        requestIds.set(request, requestId);
        if (shouldCaptureNetworkEntry(request.url(), request.resourceType())) {
            networkLogs.push({
                id: requestId,
                stepId: currentStepId,
                kind: 'request',
                method: request.method(),
                url: request.url(),
                resourceType: request.resourceType(),
                timestamp: new Date().toISOString(),
            });
        }
    });
    page.on('response', response => {
        const request = response.request();
        if (!shouldCaptureNetworkEntry(request.url(), request.resourceType()))
            return;
        networkLogs.push({
            id: requestIds.get(request) ?? crypto.randomUUID(),
            stepId: currentStepId,
            kind: 'response',
            method: request.method(),
            url: request.url(),
            resourceType: request.resourceType(),
            status: response.status(),
            timestamp: new Date().toISOString(),
        });
    });
    page.on('requestfailed', request => {
        if (!shouldCaptureNetworkEntry(request.url(), request.resourceType()))
            return;
        networkLogs.push({
            id: requestIds.get(request) ?? crypto.randomUUID(),
            stepId: currentStepId,
            kind: 'failed',
            method: request.method(),
            url: request.url(),
            resourceType: request.resourceType(),
            error: request.failure()?.errorText,
            timestamp: new Date().toISOString(),
        });
    });
    try {
        for (const step of steps) {
            currentStepId = step.id;
            const result = await executeStep(page, step, runId);
            stepResults.push(result);
            await postResult(runId, {
                status: 'running',
                stepResults,
                consoleLogs: compactConsoleLogs(consoleLogs),
                networkLogs: compactNetworkLogs(networkLogs),
                durationMs: Date.now() - runStart,
            }).catch(err => {
                console.error('Erro ao publicar progresso do run:', err);
            });
            if (result.status === 'failed')
                break;
        }
    }
    finally {
        await context.close();
        await browser.close();
    }
    const allPassed = stepResults.every(r => r.status === 'passed');
    await postResult(runId, {
        status: allPassed ? 'passed' : 'failed',
        stepResults,
        consoleLogs: compactConsoleLogs(consoleLogs),
        networkLogs: compactNetworkLogs(networkLogs),
        durationMs: Date.now() - runStart,
    });
}
async function executeStep(page, step, runId) {
    const start = Date.now();
    try {
        const code = compileStep(step);
        // eslint-disable-next-line no-new-func
        await new Function('page', 'expect', `return (async () => { ${code} })()`)(page, expect);
        const screenshotPath = await saveStepScreenshot(page, runId, step.id);
        return {
            stepId: step.id,
            type: step.type,
            status: 'passed',
            durationMs: Date.now() - start,
            screenshotPath,
        };
    }
    catch (err) {
        const screenshotPath = await saveStepScreenshot(page, runId, step.id);
        return {
            stepId: step.id,
            type: step.type,
            status: 'failed',
            durationMs: Date.now() - start,
            error: String(err),
            screenshotPath,
        };
    }
}
async function saveStepScreenshot(page, runId, stepId) {
    try {
        return await saveScreenshot(page, runId, stepId);
    }
    catch (err) {
        console.error(`Erro ao salvar screenshot do step ${stepId}:`, err);
        return undefined;
    }
}
function shouldCaptureNetworkEntry(url, resourceType) {
    if (resourceType === 'document')
        return true;
    if (resourceType === 'xhr' || resourceType === 'fetch')
        return true;
    if (resourceType === 'script' || resourceType === 'stylesheet')
        return true;
    return !/^data:|^blob:/.test(url);
}
function compactConsoleLogs(logs) {
    return logs.slice(-120);
}
function compactNetworkLogs(logs) {
    return logs.slice(-180);
}
function normalizeConsoleType(type) {
    if (type === 'warning')
        return 'warn';
    if (type === 'trace')
        return 'trace';
    if (type === 'debug')
        return 'debug';
    if (type === 'error')
        return 'error';
    if (type === 'info')
        return 'info';
    return 'log';
}
//# sourceMappingURL=executor.js.map