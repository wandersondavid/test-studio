import { User, type IUser } from '../models/User.js'

export class UserService {
  async countUsers(): Promise<number> {
    return User.countDocuments()
  }

  async findAll(): Promise<IUser[]> {
    return User.find().sort({ createdAt: -1 })
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id)
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.trim().toLowerCase() })
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    return User.create(data)
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true })
  }
}
