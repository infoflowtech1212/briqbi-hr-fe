import { Router, type Request, type Response } from 'express'
import { JobOpeningModel } from '../models/JobOpening'
import { syncJobOpenings } from '../services/jobPostingsSync'

export const jobOpeningsRouter = Router()

jobOpeningsRouter.get('/job-openings', async (req: Request, res: Response) => {
  const activeOnly = req.query.active === 'true'
  const filter = activeOnly ? { isActive: true } : {}
  const jobs = await JobOpeningModel.find(filter).sort({ postedAt: -1 })
  res.json({ data: jobs })
})

jobOpeningsRouter.post('/job-openings/sync', async (_req: Request, res: Response) => {
  try {
    const result = await syncJobOpenings()
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(502).json({ ok: false, error: err instanceof Error ? err.message : 'Sync failed' })
  }
})
