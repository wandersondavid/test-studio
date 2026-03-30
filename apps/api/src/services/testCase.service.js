import { TestCase } from '../models/TestCase.js';
export class TestCaseService {
    async findAll(suiteId) {
        const filter = suiteId ? { suiteId } : {};
        return TestCase.find(filter).sort({ createdAt: -1 });
    }
    async findById(id) {
        return TestCase.findById(id);
    }
    async findByIds(ids) {
        return TestCase.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
    }
    async create(data) {
        return TestCase.create(data);
    }
    async update(id, data) {
        const nextData = { ...data };
        const shouldUnsetSetup = Object.prototype.hasOwnProperty.call(nextData, 'setupCaseId') && !nextData.setupCaseId;
        if (shouldUnsetSetup) {
            delete nextData.setupCaseId;
            return TestCase.findByIdAndUpdate(id, {
                $set: nextData,
                $unset: { setupCaseId: 1 },
            }, { new: true });
        }
        return TestCase.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        return this.deleteMany([id]);
    }
    async deleteMany(ids) {
        const uniqueIds = [...new Set(ids)];
        if (uniqueIds.length === 0) {
            return { deletedIds: [], clearedSetupRefsCount: 0 };
        }
        const clearRefsResult = await TestCase.updateMany({ setupCaseId: { $in: uniqueIds } }, { $unset: { setupCaseId: 1 } });
        await TestCase.deleteMany({ _id: { $in: uniqueIds } });
        return {
            deletedIds: uniqueIds,
            clearedSetupRefsCount: clearRefsResult.modifiedCount ?? 0,
        };
    }
    async wouldCreateSetupCycle(caseId, candidateSetupId) {
        if (!candidateSetupId)
            return false;
        if (candidateSetupId === caseId)
            return true;
        const visited = new Set();
        let currentId = candidateSetupId;
        while (currentId) {
            if (currentId === caseId) {
                return true;
            }
            if (visited.has(currentId)) {
                return true;
            }
            visited.add(currentId);
            const current = await this.findById(currentId);
            currentId = current?.setupCaseId;
        }
        return false;
    }
    async resolveExecutableById(id) {
        const item = await this.findById(id);
        if (!item) {
            return null;
        }
        const steps = await this.resolveSetupSteps(id);
        const plain = item.toObject();
        return {
            ...plain,
            _id: item.id,
            steps,
        };
    }
    async resolveSetupSteps(id, trail = []) {
        if (trail.includes(id)) {
            throw new Error('Foi detectado um ciclo entre cenários base/setup.');
        }
        const item = await this.findById(id);
        if (!item) {
            throw new Error('Cenário base/setup não encontrado.');
        }
        const setupSteps = item.setupCaseId
            ? await this.resolveSetupSteps(item.setupCaseId, [...trail, id])
            : [];
        return [...setupSteps, ...item.steps];
    }
}
//# sourceMappingURL=testCase.service.js.map