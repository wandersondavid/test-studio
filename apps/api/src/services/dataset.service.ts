import { Dataset, IDataset } from '../models/Dataset.js'

export class DatasetService {
  async findAll(): Promise<IDataset[]> {
    return Dataset.find().sort({ createdAt: -1 })
  }

  async findById(id: string): Promise<IDataset | null> {
    return Dataset.findById(id)
  }

  async create(data: Partial<IDataset>): Promise<IDataset> {
    return Dataset.create(data)
  }

  async update(id: string, data: Partial<IDataset>): Promise<IDataset | null> {
    return Dataset.findByIdAndUpdate(id, data, { new: true })
  }

  async delete(id: string): Promise<void> {
    await Dataset.findByIdAndDelete(id)
  }
}
