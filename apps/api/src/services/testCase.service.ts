import { TestCase, ITestCase } from '../models/TestCase.js'

export class TestCaseService {
  async findAll(suiteId?: string): Promise<ITestCase[]> {
    const filter = suiteId ? { suiteId } : {}
    return TestCase.find(filter).sort({ createdAt: -1 })
  }

  async findById(id: string): Promise<ITestCase | null> {
    return TestCase.findById(id)
  }

  async create(data: Partial<ITestCase>): Promise<ITestCase> {
    return TestCase.create(data)
  }

  async update(id: string, data: Partial<ITestCase>): Promise<ITestCase | null> {
    return TestCase.findByIdAndUpdate(id, data, { new: true })
  }

  async delete(id: string): Promise<void> {
    await TestCase.findByIdAndDelete(id)
  }
}
