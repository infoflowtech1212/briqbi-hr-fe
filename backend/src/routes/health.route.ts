import { Router } from 'express'
import { dbState } from '../db/connect'

export const healthRouter = Router()

healthRouter.get('/health', (_req, res) => {
  res.json({ ok: true, mongo: dbState() })
})
