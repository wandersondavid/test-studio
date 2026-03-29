import type { TestCase as SharedTestCase, TestStep } from '@test-studio/shared-types'
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
    const nextData = { ...data } as Record<string, unknown>
    const shouldUnsetSetup = Object.prototype.hasOwnProperty.call(nextData, 'setupCaseId') && !nextData.setupCaseId

    if (shouldUnsetSetup) {
      delete nextData.setupCaseId
      return TestCase.findByIdAndUpdate(
        id,
        {
          $set: nextData,
          $unset: { setupCaseId: 1 },
        },
        { new: true }
      )
    }

    return TestCase.findByIdAndUpdate(id, data, { new: true })
  }

  async delete(id: string): Promise<void> {
    await TestCase.findByIdAndDelete(id)
  }

  async wouldCreateSetupCycle(caseId: string, candidateSetupId?: string): Promise<boolean> {
    if (!candidateSetupId) return false
    if (candidateSetupId === caseId) return true

    const visited = new Set<string>()
    let currentId: string | undefined = candidateSetupId

    while (currentId) {
      if (currentId === caseId) {
        return true
      }

      if (visited.has(currentId)) {
        return true
      }

      visited.add(currentId)
      const current = await this.findById(currentId)
      currentId = current?.setupCaseId
    }

    return false
  }

  async resolveExecutableById(id: string): Promise<SharedTestCase | null> {
    const item = await this.findById(id)
    if (!item) {
      return null
    }

    const steps = await this.resolveSetupSteps(id)
    const plain = item.toObject() as Record<string, unknown>

    return {
      ...(plain as unknown as SharedTestCase),
      _id: item.id,
      steps,
    }
  }

  private async resolveSetupSteps(id: string, trail: string[] = []): Promise<TestStep[]> {
    if (trail.includes(id)) {
      throw new Error('Foi detectado um ciclo entre cenários base/setup.')
    }

    const item = await this.findById(id)
    if (!item) {
      throw new Error('Cenário base/setup não encontrado.')
    }

    const setupSteps = item.setupCaseId
      ? await this.resolveSetupSteps(item.setupCaseId, [...trail, id])
      : []

    return [...setupSteps, ...(item.steps as unknown as TestStep[])]
  }
}
