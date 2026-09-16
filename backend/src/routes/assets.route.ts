import { Router, type Request, type Response } from 'express'
import { AssetModel } from '../models/Asset'

export const assetsRouter = Router()

assetsRouter.get('/assets', async (_req: Request, res: Response) => {
  const assets = await AssetModel.find().sort({ createdAt: -1 })
  res.json({ data: assets })
})

assetsRouter.post('/assets', async (req: Request, res: Response) => {
  const { teamMemberId, assetType, status, serialNumber, conditionAtIssue } = req.body ?? {}

  if (!teamMemberId || typeof teamMemberId !== 'string') {
    return res.status(400).json({ error: 'Team member is required.' })
  }
  if (assetType === undefined || assetType === null || Number.isNaN(Number(assetType))) {
    return res.status(400).json({ error: 'Asset type is required.' })
  }

  try {
    const asset = await AssetModel.create({
      teamMemberId,
      assetType: Number(assetType),
      status: status !== undefined && status !== null ? Number(status) : 0,
      serialNumber,
      conditionAtIssue,
    })
    res.status(201).json(asset)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to create asset.' })
  }
})

assetsRouter.patch('/assets/:id', async (req: Request, res: Response) => {
  const { teamMemberId, assetType, status, serialNumber, conditionAtIssue } = req.body ?? {}
  const update: Record<string, unknown> = {}
  if (teamMemberId !== undefined) update.teamMemberId = teamMemberId
  if (assetType !== undefined) update.assetType = Number(assetType)
  if (status !== undefined) update.status = Number(status)
  if (serialNumber !== undefined) update.serialNumber = serialNumber
  if (conditionAtIssue !== undefined) update.conditionAtIssue = conditionAtIssue

  try {
    const asset = await AssetModel.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!asset) return res.status(404).json({ error: 'Asset not found.' })
    res.json(asset)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update asset.' })
  }
})

assetsRouter.delete('/assets/:id', async (req: Request, res: Response) => {
  try {
    const asset = await AssetModel.findByIdAndDelete(req.params.id)
    if (!asset) return res.status(404).json({ error: 'Asset not found.' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to delete asset.' })
  }
})
