import type { AuditedResource } from './audit';
import type { TestStep } from './testStep';
export interface ReusableBlockParameter {
    key: string;
    label?: string;
    description?: string;
    required?: boolean;
    defaultValue?: string;
    secret?: boolean;
}
export interface ReusableBlock extends AuditedResource {
    _id: string;
    name: string;
    description?: string;
    steps: TestStep[];
    parameters?: ReusableBlockParameter[];
    createdAt: string;
    updatedAt: string;
}
export interface CreateReusableBlockInput {
    name: string;
    description?: string;
    steps: TestStep[];
    parameters?: ReusableBlockParameter[];
}
//# sourceMappingURL=reusableBlock.d.ts.map