import { Router } from 'express';
import { ScheduleService } from '../services/schedule.service.js';
import { ScheduleModel } from '../models/Schedule.js';
import { TestRunService } from '../services/testRun.service.js';
import { createScheduleSchema, updateScheduleSchema } from '../schemas/schedule.schema.js';
import { registerTask, unregisterTask } from '../services/scheduler.service.js';
import { getRunnerSharedSecret } from '../utils/auth.js';
const scheduleService = new ScheduleService();
const runService = new TestRunService();
export const scheduleRouter = Router();
scheduleRouter.get('/', async (req, res, next) => {
    try {
        res.json(await scheduleService.find());
    }
    catch (err) {
        next(err);
    }
});
scheduleRouter.get('/:id', async (req, res, next) => {
    try {
        const item = await scheduleService.findById(req.params.id);
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
scheduleRouter.post('/', async (req, res, next) => {
    try {
        const data = createScheduleSchema.parse(req.body);
        const item = await scheduleService.create({ ...data, createdBy: req.auth.actor });
        registerTask(item);
        res.status(201).json(item);
    }
    catch (err) {
        next(err);
    }
});
scheduleRouter.put('/:id', async (req, res, next) => {
    try {
        const data = updateScheduleSchema.parse(req.body);
        const item = await scheduleService.update(req.params.id, data);
        if (!item) {
            res.status(404).json({ error: 'Não encontrado' });
            return;
        }
        registerTask(item);
        res.json(item);
    }
    catch (err) {
        next(err);
    }
});
scheduleRouter.delete('/:id', async (req, res, next) => {
    try {
        const removed = await scheduleService.remove(req.params.id);
        if (!removed) {
            res.status(404).json({ error: 'Não encontrado' });
            return;
        }
        unregisterTask(req.params.id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
scheduleRouter.post('/:id/trigger', async (req, res, next) => {
    try {
        const schedule = await ScheduleModel.findById(req.params.id);
        if (!schedule) {
            res.status(404).json({ error: 'Agendamento não encontrado' });
            return;
        }
        const testRun = await runService.create({
            caseId: schedule.caseId.toString(),
            environmentId: schedule.environmentId.toString(),
            datasetId: schedule.datasetId?.toString(),
            requestedBy: req.auth.actor,
            requestedVia: 'scheduled',
        });
        await runService.updateStatus(testRun.id, 'running');
        await scheduleService.updateLastRun(schedule.id);
        const runnerUrl = process.env.RUNNER_URL ?? 'http://localhost:3002';
        fetch(`${runnerUrl}/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-runner-secret': getRunnerSharedSecret(),
            },
            body: JSON.stringify({ runId: testRun.id }),
        }).catch(err => {
            console.error('[schedule/trigger] Runner trigger failed:', err);
            runService.updateStatus(testRun.id, 'error');
        });
        res.status(202).json(testRun);
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=schedule.routes.js.map