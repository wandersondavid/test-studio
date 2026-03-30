import type { ReusableBlockParameter, TestStep } from '@test-studio/shared-types';
export declare function collectTemplateVariables(steps: TestStep[]): string[];
export declare function buildParameterValueMap(parameters: Array<ReusableBlockParameter | {
    key: string;
    defaultValue?: string;
}>, values: Record<string, string | undefined>): Record<string, string>;
export declare function interpolateStepsWithVariables(steps: TestStep[], variables: Record<string, string>): TestStep[];
//# sourceMappingURL=blockInterpolation.d.ts.map