import { TestRun, ITestRun } from '../models/TestRun.js'
import type { StepResult } from '@test-studio/shared-types'

export class TestRunService {
  async findAll(): Promise<ITestRun[]> {
    return TestRun.find().sort({ createdAt: -1 })
  }

  async findById(id: string): Promise<ITestRun | null> {
    return TestRun.findById(id)
  }

  async create(data: { caseId: string; environmentId: string; datasetId?: string }): Promise<ITestRun> {
    return TestRun.create({ ...data, status: 'pending' })
  }

  async updateResult(
    id: string,
    result: {
      status: ITestRun['status']
      stepResults: StepResult[]
      durationMs: number
      videoPath?: string
      tracePath?: string
      error?: string
    }
  ): Promise<ITestRun | null> {
    return TestRun.findByIdAndUpdate(id, result, { new: true })
  }

  async updateStatus(id: string, status: ITestRun['status']): Promise<void> {
    await TestRun.findByIdAndUpdate(id, { status })
  }
}
