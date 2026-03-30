import type { Environment, TestCase, Dataset } from '@test-studio/shared-types';
interface RunInput {
    runId: string;
    testCase: TestCase;
    environment: Environment;
    dataset: Dataset | null;
}
export declare function runTestCase({ runId, testCase, environment, dataset }: RunInput): Promise<void>;
export {};
//# sourceMappingURL=executor.d.ts.map