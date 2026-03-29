import { ReusableBlock, type IReusableBlock } from '../models/ReusableBlock.js'

export class ReusableBlockService {
  async findAll(): Promise<IReusableBlock[]> {
    return ReusableBlock.find().sort({ createdAt: -1 })
  }

  async findById(id: string): Promise<IReusableBlock | null> {
    return ReusableBlock.findById(id)
  }

  async create(data: Partial<IReusableBlock>): Promise<IReusableBlock> {
    return ReusableBlock.create(data)
  }

  async update(id: string, data: Partial<IReusableBlock>): Promise<IReusableBlock | null> {
    return ReusableBlock.findByIdAndUpdate(id, data, { new: true })
  }

  async delete(id: string): Promise<void> {
    await ReusableBlock.findByIdAndDelete(id)
  }
}
