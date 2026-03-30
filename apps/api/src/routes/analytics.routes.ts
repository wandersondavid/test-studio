import { Router, Request, Response, NextFunction } from 'express'
import { TestRun } from '../models/TestRun.js'

export const analyticsRouter = Router()

analyticsRouter.get('/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const [totals, dailyRaw] = await Promise.all([
      TestRun.aggregate<{
        total: number
        passed: number
        failed: number
        avgDurationMs: number
      }>([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            passed: { $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $in: ['$status', ['failed', 'error']] }, 1, 0] } },
            avgDurationMs: { $avg: '$durationMs' },
          },
        },
      ]),
      TestRun.aggregate<{ _id: string; passed: number; failed: number; total: number }>([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            passed: { $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $in: ['$status', ['failed', 'error']] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    const stats = totals[0] ?? { total: 0, passed: 0, failed: 0, avgDurationMs: 0 }

    // Fill in missing days so we always return 7 entries
    const dayMap = new Map(dailyRaw.map(d => [d._id, d]))
    const runsLast7Days: Array<{ date: string; passed: number; failed: number; total: number }> = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const entry = dayMap.get(key)
      runsLast7Days.push({ date: key, passed: entry?.passed ?? 0, failed: entry?.failed ?? 0, total: entry?.total ?? 0 })
    }

    res.json({
      totalRuns: stats.total,
      passedRuns: stats.passed,
      failedRuns: stats.failed,
      passRate: stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0,
      avgDurationMs: Math.round(stats.avgDurationMs ?? 0),
      runsLast7Days,
    })
  } catch (err) { next(err) }
})

analyticsRouter.get('/flakiness', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await TestRun.aggregate<{
      caseId: string
      caseName: string
      totalRuns: number
      passedRuns: number
      failedRuns: number
      flakinessScore: number
    }>([
      {
        $group: {
          _id: '$caseId',
          totalRuns: { $sum: 1 },
          passedRuns: { $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] } },
          failedRuns: { $sum: { $cond: [{ $in: ['$status', ['failed', 'error']] }, 1, 0] } },
        },
      },
      { $match: { totalRuns: { $gte: 1 } } },
      {
        $addFields: {
          flakinessScore: {
            $multiply: [{ $divide: ['$failedRuns', '$totalRuns'] }, 100],
          },
        },
      },
      { $sort: { flakinessScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'testcases',
          let: { cid: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$cid'] } } },
            { $project: { name: 1 } },
          ],
          as: 'caseInfo',
        },
      },
      {
        $project: {
          _id: 0,
          caseId: '$_id',
          caseName: { $ifNull: [{ $arrayElemAt: ['$caseInfo.name', 0] }, 'Unknown'] },
          totalRuns: 1,
          passedRuns: 1,
          failedRuns: 1,
          flakinessScore: { $round: ['$flakinessScore', 1] },
        },
      },
    ])

    res.json(results)
  } catch (err) { next(err) }
})

analyticsRouter.get('/slowest-steps', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await TestRun.aggregate<{
      stepId: string
      type: string
      description?: string
      selector?: string
      avgDurationMs: number
      occurrences: number
    }>([
      { $unwind: '$stepResults' },
      {
        $group: {
          _id: '$stepResults.stepId',
          type: { $first: '$stepResults.type' },
          avgDurationMs: { $avg: '$stepResults.durationMs' },
          occurrences: { $sum: 1 },
        },
      },
      { $sort: { avgDurationMs: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          stepId: '$_id',
          type: 1,
          avgDurationMs: { $round: ['$avgDurationMs', 0] },
          occurrences: 1,
        },
      },
    ])

    res.json(results)
  } catch (err) { next(err) }
})
