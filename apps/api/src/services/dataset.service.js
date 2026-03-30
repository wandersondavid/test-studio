import { Dataset } from '../models/Dataset.js';
export class DatasetService {
    async findAll() {
        return Dataset.find().sort({ createdAt: -1 });
    }
    async findById(id) {
        return Dataset.findById(id);
    }
    async create(data) {
        return Dataset.create(data);
    }
    async update(id, data) {
        return Dataset.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        await Dataset.findByIdAndDelete(id);
    }
}
//# sourceMappingURL=dataset.service.js.map