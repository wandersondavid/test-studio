import { Environment } from '../models/Environment.js';
export class EnvironmentService {
    async findAll() {
        return Environment.find().sort({ createdAt: -1 });
    }
    async findById(id) {
        return Environment.findById(id);
    }
    async create(data) {
        return Environment.create(data);
    }
    async update(id, data) {
        return Environment.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        await Environment.findByIdAndDelete(id);
    }
}
//# sourceMappingURL=environment.service.js.map