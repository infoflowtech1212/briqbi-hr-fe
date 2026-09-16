import { Router, type Request, type Response } from 'express'
import { TeamMemberModel } from '../models/TeamMember'

export const teamMembersRouter = Router()

const PREFIX_BY_PERSON_TYPE: Record<number, string> = { 0: 'EMP', 1: 'CON', 2: 'INT' }

/** Mirrors the "assign member ID" flow: EMP-/CON-/INT- + a shared sequence, seeded at 1000. */
async function nextMemberId(personType: number): Promise<string> {
  const prefix = PREFIX_BY_PERSON_TYPE[personType] ?? 'EMP'
  const members = await TeamMemberModel.find({}, { memberId: 1 }).lean()
  let max = 999
  for (const m of members) {
    const match = /(\d{3,})$/.exec(m.memberId ?? '')
    if (match) {
      const n = parseInt(match[1], 10)
      if (n > max) max = n
    }
  }
  return `${prefix}-${max + 1}`
}

teamMembersRouter.get('/team-members', async (_req: Request, res: Response) => {
  const members = await TeamMemberModel.find().sort({ createdAt: -1 })
  res.json({ data: members })
})

teamMembersRouter.post('/team-members', async (req: Request, res: Response) => {
  const { fullName, personType, department, workEmail } = req.body ?? {}

  if (!fullName || typeof fullName !== 'string') {
    return res.status(400).json({ error: 'Full Name is required.' })
  }
  if (personType === undefined || personType === null || Number.isNaN(Number(personType))) {
    return res.status(400).json({ error: 'Person Type is required.' })
  }
  if (department === undefined || department === null || Number.isNaN(Number(department))) {
    return res.status(400).json({ error: 'Department is required.' })
  }
  if (!workEmail || typeof workEmail !== 'string') {
    return res.status(400).json({ error: 'Work Email is required.' })
  }

  try {
    const memberId = await nextMemberId(Number(personType))
    const member = await TeamMemberModel.create({
      memberId,
      fullName,
      personType: Number(personType),
      department: Number(department),
      workEmail,
      memberStatus: 0, // Joining
      onboardingStage: 0, // Offer
      bgvOverdue: false,
    })
    res.status(201).json(member)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to create team member.' })
  }
})

teamMembersRouter.patch('/team-members/:id', async (req: Request, res: Response) => {
  const { fullName, personType, department, workEmail, memberStatus } = req.body ?? {}
  const update: Record<string, unknown> = {}
  if (fullName !== undefined) update.fullName = fullName
  if (personType !== undefined) update.personType = Number(personType)
  if (department !== undefined) update.department = Number(department)
  if (workEmail !== undefined) update.workEmail = workEmail
  if (memberStatus !== undefined) update.memberStatus = Number(memberStatus)

  try {
    const member = await TeamMemberModel.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!member) return res.status(404).json({ error: 'Team member not found.' })
    res.json(member)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update team member.' })
  }
})

teamMembersRouter.delete('/team-members/:id', async (req: Request, res: Response) => {
  try {
    const member = await TeamMemberModel.findByIdAndDelete(req.params.id)
    if (!member) return res.status(404).json({ error: 'Team member not found.' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to delete team member.' })
  }
})
