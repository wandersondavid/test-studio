import fs from 'fs/promises'
import path from 'path'
import type { Page } from '@playwright/test'

const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR ?? './artifacts'

export function getRunArtifactsDir(runId: string): string {
  return path.join(ARTIFACTS_DIR, runId)
}

export function getRunVideoDir(runId: string): string {
  return path.join(getRunArtifactsDir(runId), 'videos')
}

export async function ensureArtifactDir(runId: string): Promise<void> {
  await fs.mkdir(path.join(getRunArtifactsDir(runId), 'screenshots'), { recursive: true })
  await fs.mkdir(getRunVideoDir(runId), { recursive: true })
}

export async function saveScreenshot(page: Page, runId: string, stepId: string): Promise<string> {
  const filePath = path.join(getRunArtifactsDir(runId), 'screenshots', `${stepId}.png`)
  await page.screenshot({ path: filePath, fullPage: true })
  return filePath
}
