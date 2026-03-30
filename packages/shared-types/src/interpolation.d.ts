import type { ReusableBlockParameter } from './reusableBlock';
import type { TestStep } from './testStep';
export declare function interpolateTemplate(value: string, variables: Record<string, string>): string;
export declare function interpolateOptionalTemplate(value: string | undefined, variables: Record<string, string>): string | undefined;
export declare function collectTemplateVariables(steps: TestStep[]): string[];
export declare function buildParameterValueMap(parameters: Array<ReusableBlockParameter | {
    key: string;
    defaultValue?: string;
}>, values: Record<string, string | undefined>): Record<string, string>;
export declare function interpolateStepWithVariables(step: TestStep, variables: Record<string, string>): TestStep;
export declare function interpolateStepsWithVariables(steps: TestStep[], variables: Record<string, string>): TestStep[];
//# sourceMappingURL=interpolation.d.ts.map