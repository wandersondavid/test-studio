import fs from 'fs/promises';
import path from 'path';
const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR ?? './artifacts';
export function getRunArtifactsDir(runId) {
    return path.join(ARTIFACTS_DIR, runId);
}
export function getRunVideoDir(runId) {
    return path.join(getRunArtifactsDir(runId), 'videos');
}
export async function ensureArtifactDir(runId) {
    await fs.mkdir(path.join(getRunArtifactsDir(runId), 'screenshots'), { recursive: true });
    await fs.mkdir(getRunVideoDir(runId), { recursive: true });
}
export async function saveScreenshot(page, runId, stepId) {
    const filePath = path.join(getRunArtifactsDir(runId), 'screenshots', `${stepId}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    return filePath;
}
//# sourceMappingURL=artifacts.js.map