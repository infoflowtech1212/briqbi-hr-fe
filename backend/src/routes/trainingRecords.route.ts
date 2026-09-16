import { Router, type Request, type Response } from 'express'
import { TrainingRecordModel } from '../models/TrainingRecord'

export const trainingRecordsRouter = Router()

trainingRecordsRouter.get('/training-records', async (_req: Request, res: Response) => {
  const records = await TrainingRecordModel.find().sort({ createdAt: -1 })
  res.json({ data: records })
})

trainingRecordsRouter.post('/training-records', async (req: Request, res: Response) => {
  const { teamMemberId, trainingType, provider, completedDate, expiryDate } = req.body ?? {}

  if (!teamMemberId || typeof teamMemberId !== 'string') {
    return res.status(400).json({ error: 'Team member is required.' })
  }
  if (trainingType === undefined || trainingType === null || Number.isNaN(Number(trainingType))) {
    return res.status(400).json({ error: 'Training type is required.' })
  }

  try {
    const record = await TrainingRecordModel.create({
      teamMemberId,
      trainingType: Number(trainingType),
      trainingStatus: 0, // Not started
      provider,
      completedDate,
      expiryDate,
    })
    res.status(201).json(record)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to create training record.' })
  }
})

trainingRecordsRouter.patch('/training-records/:id', async (req: Request, res: Response) => {
  const { teamMemberId, trainingType, trainingStatus, provider, completedDate, expiryDate } = req.body ?? {}
  const update: Record<string, unknown> = {}
  if (teamMemberId !== undefined) update.teamMemberId = teamMemberId
  if (trainingType !== undefined) update.trainingType = Number(trainingType)
  if (trainingStatus !== undefined) update.trainingStatus = Number(trainingStatus)
  if (provider !== undefined) update.provider = provider
  if (completedDate !== undefined) update.completedDate = completedDate
  if (expiryDate !== undefined) update.expiryDate = expiryDate

  try {
    const record = await TrainingRecordModel.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!record) return res.status(404).json({ error: 'Training record not found.' })
    res.json(record)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update training record.' })
  }
})

trainingRecordsRouter.delete('/training-records/:id', async (req: Request, res: Response) => {
  try {
    const record = await TrainingRecordModel.findByIdAndDelete(req.params.id)
    if (!record) return res.status(404).json({ error: 'Training record not found.' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to delete training record.' })
  }
})
