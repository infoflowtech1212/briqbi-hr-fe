import { Router, type Request, type Response } from 'express'
import { JoiningTaskModel } from '../models/JoiningTask'

export const joiningTasksRouter = Router()

joiningTasksRouter.get('/joining-tasks', async (_req: Request, res: Response) => {
  const tasks = await JoiningTaskModel.find().sort({ sequence: 1, createdAt: -1 })
  res.json({ data: tasks })
})

joiningTasksRouter.post('/joining-tasks', async (req: Request, res: Response) => {
  const { teamMemberId, stage, mustDo, responsible, sequence, dueDate } = req.body ?? {}

  if (!teamMemberId || typeof teamMemberId !== 'string') {
    return res.status(400).json({ error: 'Team member is required.' })
  }
  if (stage === undefined || stage === null || Number.isNaN(Number(stage))) {
    return res.status(400).json({ error: 'Stage is required.' })
  }
  if (!responsible || typeof responsible !== 'string') {
    return res.status(400).json({ error: 'Owner is required.' })
  }

  try {
    const task = await JoiningTaskModel.create({
      teamMemberId,
      stage: Number(stage),
      status: 0, // Not started
      mustDo: mustDo === undefined ? true : Boolean(mustDo),
      responsible,
      sequence: sequence !== undefined && sequence !== null && sequence !== '' ? Number(sequence) : 1,
      dueDate,
    })
    res.status(201).json(task)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to create joining task.' })
  }
})

joiningTasksRouter.patch('/joining-tasks/:id', async (req: Request, res: Response) => {
  const { teamMemberId, stage, status, mustDo, responsible, sequence, dueDate, completedDate } = req.body ?? {}
  const update: Record<string, unknown> = {}
  if (teamMemberId !== undefined) update.teamMemberId = teamMemberId
  if (stage !== undefined) update.stage = Number(stage)
  if (status !== undefined) update.status = Number(status)
  if (mustDo !== undefined) update.mustDo = Boolean(mustDo)
  if (responsible !== undefined) update.responsible = responsible
  if (sequence !== undefined) update.sequence = Number(sequence)
  if (dueDate !== undefined) update.dueDate = dueDate
  if (completedDate !== undefined) update.completedDate = completedDate

  try {
    const task = await JoiningTaskModel.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!task) return res.status(404).json({ error: 'Joining task not found.' })
    res.json(task)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update joining task.' })
  }
})

joiningTasksRouter.delete('/joining-tasks/:id', async (req: Request, res: Response) => {
  try {
    const task = await JoiningTaskModel.findByIdAndDelete(req.params.id)
    if (!task) return res.status(404).json({ error: 'Joining task not found.' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to delete joining task.' })
  }
})
