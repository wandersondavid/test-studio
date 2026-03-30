import { Router } from 'express';
import { NotificationChannelService } from '../services/notificationChannel.service.js';
import { createNotificationChannelSchema, updateNotificationChannelSchema, } from '../schemas/notificationChannel.schema.js';
const service = new NotificationChannelService();
export const notificationChannelRouter = Router();
notificationChannelRouter.get('/', async (req, res, next) => {
    try {
        res.json(await service.findAll());
    }
    catch (err) {
        next(err);
    }
});
notificationChannelRouter.get('/:id', async (req, res, next) => {
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
notificationChannelRouter.post('/', async (req, res, next) => {
    try {
        const data = createNotificationChannelSchema.parse(req.body);
        const item = await service.create({ ...data, createdBy: req.auth.actor });
        res.status(201).json(item);
    }
    catch (err) {
        next(err);
    }
});
notificationChannelRouter.put('/:id', async (req, res, next) => {
    try {
        const data = updateNotificationChannelSchema.parse(req.body);
        const item = await service.update(req.params.id, data);
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
notificationChannelRouter.delete('/:id', async (req, res, next) => {
    try {
        await service.delete(req.params.id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
notificationChannelRouter.post('/:id/test', async (req, res, next) => {
    try {
        const channel = await service.findById(req.params.id);
        if (!channel) {
            res.status(404).json({ error: 'Não encontrado' });
            return;
        }
        const body = channel.type === 'slack'
            ? { text: '🔔 Test Studio — this is a test notification from your workspace.' }
            : { runId: 'test', status: 'test', caseName: 'Test Notification', environmentId: 'N/A', durationMs: 0 };
        try {
            const resp = await fetch(channel.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!resp.ok) {
                res.status(502).json({ error: `Webhook respondeu com status ${resp.status}: ${resp.statusText}` });
                return;
            }
        }
        catch (fetchErr) {
            res.status(502).json({ error: `Falha ao conectar no webhook: ${fetchErr.message}` });
            return;
        }
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=notificationChannel.routes.js.map