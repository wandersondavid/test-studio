import { ReusableBlock } from '../models/ReusableBlock.js';
export class ReusableBlockService {
    async findAll() {
        return ReusableBlock.find().sort({ createdAt: -1 });
    }
    async findById(id) {
        return ReusableBlock.findById(id);
    }
    async create(data) {
        return ReusableBlock.create(data);
    }
    async update(id, data) {
        return ReusableBlock.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        await ReusableBlock.findByIdAndDelete(id);
    }
}
//# sourceMappingURL=reusableBlock.service.js.map