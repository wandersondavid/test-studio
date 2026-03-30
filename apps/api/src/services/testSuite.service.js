import { TestSuite } from '../models/TestSuite.js';
export class TestSuiteService {
    async findAll() {
        return TestSuite.find().sort({ createdAt: -1 });
    }
    async findById(id) {
        return TestSuite.findById(id);
    }
    async create(data) {
        return TestSuite.create(data);
    }
    async update(id, data) {
        return TestSuite.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        await TestSuite.findByIdAndDelete(id);
    }
}
//# sourceMappingURL=testSuite.service.js.map