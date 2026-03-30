import type { Page } from '@playwright/test';
export declare function getRunArtifactsDir(runId: string): string;
export declare function getRunVideoDir(runId: string): string;
export declare function ensureArtifactDir(runId: string): Promise<void>;
export declare function saveScreenshot(page: Page, runId: string, stepId: string): Promise<string>;
//# sourceMappingURL=artifacts.d.ts.map