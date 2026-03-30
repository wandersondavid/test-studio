import type { AuditedResource } from './audit';
export interface Dataset extends AuditedResource {
    _id: string;
    name: string;
    variables: Record<string, string>;
    createdAt: string;
    updatedAt: string;
}
export interface CreateDatasetInput {
    name: string;
    variables: Record<string, string>;
}
//# sourceMappingURL=dataset.d.ts.map