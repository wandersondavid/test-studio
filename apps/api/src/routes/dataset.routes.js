import { Router } from 'express';
import { DatasetService } from '../services/dataset.service.js';
import { AuditLogService } from '../services/auditLog.service.js';
import { createDatasetSchema, updateDatasetSchema } from '../schemas/dataset.schema.js';
const service = new DatasetService();
const auditLogService = new AuditLogService();
export const datasetRouter = Router();
datasetRouter.get('/', async (req, res, next) => {
    try {
        res.json(await service.findAll());
    }
    catch (err) {
        next(err);
    }
});
datasetRouter.get('/:id', async (req, res, next) => {
    try {
        const item = await service.findById(req.params.id);
        if (!item) {
            res.status(404).json({ error: 'Não encontrado' });
            return;
        }
        res.json(item);
    }
    catch (err) {
        next(err);
    }
});
datasetRouter.post('/', async (req, res, next) => {
    try {
        const data = createDatasetSchema.parse(req.body);
        const item = await service.create({ ...data, createdBy: req.auth.actor, updatedBy: req.auth.actor });
        await auditLogService.create({
            entityType: 'dataset',
            entityId: item.id,
            action: 'dataset_created',
            summary: `Dataset "${item.name}" foi criado.`,
            actor: req.auth.actor,
            metadata: { variableCount: Object.keys(item.variables ?? {}).length },
        });
        res.status(201).json(item);
    }
    catch (err) {
        next(err);
    }
});
datasetRouter.put('/:id', async (req, res, next) => {
    try {
        const data = updateDatasetSchema.parse(req.body);
        const item = await service.update(req.params.id, { ...data, updatedBy: req.auth.actor });
        if (!item) {
            res.status(404).json({ error: 'Não encontrado' });
            return;
        }
        await auditLogService.create({
            entityType: 'dataset',
            entityId: item.id,
            action: 'dataset_updated',
            summary: `Dataset "${item.name}" foi atualizado.`,
            actor: req.auth.actor,
            metadata: { variableCount: Object.keys(item.variables ?? {}).length },
        });
        res.json(item);
    }
    catch (err) {
        next(err);
    }
});
datasetRouter.delete('/:id', async (req, res, next) => {
    try {
        const existing = await service.findById(req.params.id);
        await service.delete(req.params.id);
        if (existing) {
            await auditLogService.create({
                entityType: 'dataset',
                entityId: req.params.id,
                action: 'dataset_deleted',
                summary: `Dataset "${existing.name}" foi removido.`,
                actor: req.auth.actor,
            });
        }
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=dataset.routes.js.map