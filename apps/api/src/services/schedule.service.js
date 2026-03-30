import { ScheduleModel } from '../models/Schedule.js';
export class ScheduleService {
    async find() {
        return ScheduleModel.find().sort({ createdAt: -1 });
    }
    async findById(id) {
        return ScheduleModel.findById(id);
    }
    async findAllActive() {
        return ScheduleModel.find({ isActive: true });
    }
    async create(data) {
        return ScheduleModel.create(data);
    }
    async update(id, data) {
        return ScheduleModel.findByIdAndUpdate(id, data, { new: true });
    }
    async remove(id) {
        return ScheduleModel.findByIdAndDelete(id);
    }
    async updateLastRun(id) {
        await ScheduleModel.findByIdAndUpdate(id, { lastRunAt: new Date() });
    }
}
//# sourceMappingURL=schedule.service.js.map