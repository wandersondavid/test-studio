import { TestSuite, ITestSuite } from '../models/TestSuite.js'

export class TestSuiteService {
  async findAll(): Promise<ITestSuite[]> {
    return TestSuite.find().sort({ createdAt: -1 })
  }

  async findById(id: string): Promise<ITestSuite | null> {
    return TestSuite.findById(id)
  }

  async create(data: Partial<ITestSuite>): Promise<ITestSuite> {
    return TestSuite.create(data)
  }

  async update(id: string, data: Partial<ITestSuite>): Promise<ITestSuite | null> {
    return TestSuite.findByIdAndUpdate(id, data, { new: true })
  }

  async delete(id: string): Promise<void> {
    await TestSuite.findByIdAndDelete(id)
  }
}
