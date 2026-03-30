import type { TestStep } from '@test-studio/shared-types';
export declare function interpolate(value: string, variables: Record<string, string>): string;
export declare function interpolateStep(step: TestStep, variables: Record<string, string>): TestStep;
export declare function interpolateSteps(steps: TestStep[], variables: Record<string, string>): TestStep[];
//# sourceMappingURL=interpolator.d.ts.map