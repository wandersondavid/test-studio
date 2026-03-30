import { TestRun } from '../models/TestRun.js';
export class TestRunService {
    async findAll() {
        return TestRun.find().sort({ createdAt: -1 });
    }
    async findById(id) {
        return TestRun.findById(id);
    }
    async create(data) {
        return TestRun.create({ ...data, status: 'pending' });
    }
    async updateResult(id, result) {
        return TestRun.findByIdAndUpdate(id, result, { new: true });
    }
    async updateStatus(id, status) {
        await TestRun.findByIdAndUpdate(id, { status });
    }
}
//# sourceMappingURL=testRun.service.js.map