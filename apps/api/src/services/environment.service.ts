import { Environment, IEnvironment } from '../models/Environment.js'

export class EnvironmentService {
  async findAll(): Promise<IEnvironment[]> {
    return Environment.find().sort({ createdAt: -1 })
  }

  async findById(id: string): Promise<IEnvironment | null> {
    return Environment.findById(id)
  }

  async create(data: Partial<IEnvironment>): Promise<IEnvironment> {
    return Environment.create(data)
  }

  async update(id: string, data: Partial<IEnvironment>): Promise<IEnvironment | null> {
    return Environment.findByIdAndUpdate(id, data, { new: true })
  }

  async delete(id: string): Promise<void> {
    await Environment.findByIdAndDelete(id)
  }
}
