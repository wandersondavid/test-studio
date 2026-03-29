import fs from 'fs/promises'
import path from 'path'
import type { Page } from '@playwright/test'

const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR ?? './artifacts'

export async function ensureArtifactDir(runId: string): Promise<void> {
  await fs.mkdir(path.join(ARTIFACTS_DIR, runId, 'screenshots'), { recursive: true })
  await fs.mkdir(path.join(ARTIFACTS_DIR, runId, 'videos'), { recursive: true })
}

export async function saveScreenshot(page: Page, runId: string, stepId: string): Promise<string> {
  const filePath = path.join(ARTIFACTS_DIR, runId, 'screenshots', `${stepId}.png`)
  await page.screenshot({ path: filePath, fullPage: true })
  return filePath
}
