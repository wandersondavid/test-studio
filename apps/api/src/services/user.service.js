import { User } from '../models/User.js';
export class UserService {
    async countUsers() {
        return User.countDocuments();
    }
    async findAll() {
        return User.find().sort({ createdAt: -1 });
    }
    async findById(id) {
        return User.findById(id);
    }
    async findByEmail(email) {
        return User.findOne({ email: email.trim().toLowerCase() });
    }
    async create(data) {
        return User.create(data);
    }
    async update(id, data) {
        return User.findByIdAndUpdate(id, data, { new: true });
    }
}
//# sourceMappingURL=user.service.js.map