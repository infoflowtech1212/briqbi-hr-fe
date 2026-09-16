/**
 * Real backend calls (not the mock in mockApi.ts). Job Openings are synced
 * server-side from the live careers API (api.intranet.briqbi.com) into our
 * own MongoDB — see backend/src/services/jobPostingsSync.ts — so this just
 * reads what our own backend already has.
 */
export interface JobOpening {
  id: string
  externalId: string
  role: string
  description: string
  department: string
  companyName: string
  location: string
  employmentType: string
  isActive: boolean
  experienceRequired: number
  skills: string[]
  postedAt: string
}

interface RawJobOpening extends Omit<JobOpening, 'id'> {
  _id: string
}

export async function fetchJobOpenings(activeOnly = false): Promise<JobOpening[]> {
  const query = activeOnly ? '?active=true' : ''
  const res = await fetch(`/api/job-openings${query}`)
  if (!res.ok) throw new Error(`Failed to load job openings (${res.status})`)
  const body = (await res.json()) as { data: RawJobOpening[] }
  return body.data.map(({ _id, ...rest }) => ({ id: _id, ...rest }))
}

export interface TeamMember {
  id: string
  memberId: string
  fullName: string
  personType: number
  memberStatus: number
  onboardingStage: number
  department: number
  workEmail: string
  personalEmail?: string
  phone?: string
  emergencyContact?: string
  pan?: string
  bankAccountRef?: string
  bgvOverdue: boolean
  exitReason?: string
  lastWorkingDay?: string
}

interface RawTeamMember extends Omit<TeamMember, 'id'> {
  _id: string
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const res = await fetch('/api/team-members')
  if (!res.ok) throw new Error(`Failed to load team members (${res.status})`)
  const body = (await res.json()) as { data: RawTeamMember[] }
  return body.data.map(({ _id, ...rest }) => ({ id: _id, ...rest }))
}

export interface CreateTeamMemberInput {
  fullName: string
  personType: number
  department: number
  workEmail: string
}

export async function createTeamMember(input: CreateTeamMemberInput): Promise<TeamMember> {
  const res = await fetch('/api/team-members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `Failed to create team member (${res.status})`)
  const { _id, ...rest } = body as RawTeamMember
  return { id: _id, ...rest }
}

export interface UpdateTeamMemberInput {
  fullName?: string
  personType?: number
  department?: number
  workEmail?: string
  memberStatus?: number
}

export async function updateTeamMember(id: string, input: UpdateTeamMemberInput): Promise<TeamMember> {
  const res = await fetch(`/api/team-members/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `Failed to update team member (${res.status})`)
  const { _id, ...rest } = body as RawTeamMember
  return { id: _id, ...rest }
}

export async function deleteTeamMember(id: string): Promise<void> {
  const res = await fetch(`/api/team-members/${id}`, { method: 'DELETE' })
  if (res.ok) return
  const body = await res.json().catch(() => null)
  throw new Error(body?.error ?? `Failed to delete team member (${res.status})`)
}

export interface Asset {
  id: string
  teamMemberId: string
  assetType: number
  status: number
  serialNumber?: string
  conditionAtIssue?: string
}

interface RawAsset extends Omit<Asset, 'id'> {
  _id: string
}

export async function fetchAssets(): Promise<Asset[]> {
  const res = await fetch('/api/assets')
  if (!res.ok) throw new Error(`Failed to load assets (${res.status})`)
  const body = (await res.json()) as { data: RawAsset[] }
  return body.data.map(({ _id, ...rest }) => ({ id: _id, ...rest }))
}

export interface CreateAssetInput {
  teamMemberId: string
  assetType: number
  serialNumber?: string
  conditionAtIssue?: string
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  const res = await fetch('/api/assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `Failed to create asset (${res.status})`)
  const { _id, ...rest } = body as RawAsset
  return { id: _id, ...rest }
}

export interface UpdateAssetInput {
  teamMemberId?: string
  assetType?: number
  status?: number
  serialNumber?: string
  conditionAtIssue?: string
}

export async function updateAsset(id: string, input: UpdateAssetInput): Promise<Asset> {
  const res = await fetch(`/api/assets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `Failed to update asset (${res.status})`)
  const { _id, ...rest } = body as RawAsset
  return { id: _id, ...rest }
}

export async function deleteAsset(id: string): Promise<void> {
  const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' })
  if (res.ok) return
  const body = await res.json().catch(() => null)
  throw new Error(body?.error ?? `Failed to delete asset (${res.status})`)
}

export interface TrainingRecord {
  id: string
  teamMemberId: string
  trainingType: number
  trainingStatus: number
  provider?: string
  completedDate?: string
  expiryDate?: string
}

interface RawTrainingRecord extends Omit<TrainingRecord, 'id'> {
  _id: string
}

export async function fetchTrainingRecords(): Promise<TrainingRecord[]> {
  const res = await fetch('/api/training-records')
  if (!res.ok) throw new Error(`Failed to load training records (${res.status})`)
  const body = (await res.json()) as { data: RawTrainingRecord[] }
  return body.data.map(({ _id, ...rest }) => ({ id: _id, ...rest }))
}

export interface CreateTrainingRecordInput {
  teamMemberId: string
  trainingType: number
  provider?: string
  completedDate?: string
  expiryDate?: string
}

export async function createTrainingRecord(input: CreateTrainingRecordInput): Promise<TrainingRecord> {
  const res = await fetch('/api/training-records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `Failed to create training record (${res.status})`)
  const { _id, ...rest } = body as RawTrainingRecord
  return { id: _id, ...rest }
}

export interface UpdateTrainingRecordInput {
  teamMemberId?: string
  trainingType?: number
  trainingStatus?: number
  provider?: string
  completedDate?: string
  expiryDate?: string
}

export async function updateTrainingRecord(id: string, input: UpdateTrainingRecordInput): Promise<TrainingRecord> {
  const res = await fetch(`/api/training-records/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `Failed to update training record (${res.status})`)
  const { _id, ...rest } = body as RawTrainingRecord
  return { id: _id, ...rest }
}

export async function deleteTrainingRecord(id: string): Promise<void> {
  const res = await fetch(`/api/training-records/${id}`, { method: 'DELETE' })
  if (res.ok) return
  const body = await res.json().catch(() => null)
  throw new Error(body?.error ?? `Failed to delete training record (${res.status})`)
}

export interface JoiningTask {
  id: string
  teamMemberId: string
  stage: number
  status: number
  mustDo: boolean
  responsible: string
  sequence: number
  dueDate?: string
  completedDate?: string
}

interface RawJoiningTask extends Omit<JoiningTask, 'id'> {
  _id: string
}

export async function fetchJoiningTasks(): Promise<JoiningTask[]> {
  const res = await fetch('/api/joining-tasks')
  if (!res.ok) throw new Error(`Failed to load joining tasks (${res.status})`)
  const body = (await res.json()) as { data: RawJoiningTask[] }
  return body.data.map(({ _id, ...rest }) => ({ id: _id, ...rest }))
}

export interface CreateJoiningTaskInput {
  teamMemberId: string
  stage: number
  mustDo?: boolean
  responsible: string
  sequence?: number
  dueDate?: string
}

export async function createJoiningTask(input: CreateJoiningTaskInput): Promise<JoiningTask> {
  const res = await fetch('/api/joining-tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `Failed to create joining task (${res.status})`)
  const { _id, ...rest } = body as RawJoiningTask
  return { id: _id, ...rest }
}

export interface UpdateJoiningTaskInput {
  teamMemberId?: string
  stage?: number
  status?: number
  mustDo?: boolean
  responsible?: string
  sequence?: number
  dueDate?: string
  completedDate?: string
}

export async function updateJoiningTask(id: string, input: UpdateJoiningTaskInput): Promise<JoiningTask> {
  const res = await fetch(`/api/joining-tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `Failed to update joining task (${res.status})`)
  const { _id, ...rest } = body as RawJoiningTask
  return { id: _id, ...rest }
}

export async function deleteJoiningTask(id: string): Promise<void> {
  const res = await fetch(`/api/joining-tasks/${id}`, { method: 'DELETE' })
  if (res.ok) return
  const body = await res.json().catch(() => null)
  throw new Error(body?.error ?? `Failed to delete joining task (${res.status})`)
}
