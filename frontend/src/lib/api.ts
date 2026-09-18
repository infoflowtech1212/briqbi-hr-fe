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
  personalEmail?: string
  phone?: string
  emergencyContact?: string
  pan?: string
  bankAccountRef?: string
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
  memberName?: string
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

/** Status values as returned by the real intranet's job-applications API — a string enum, not a numeric Dataverse choice. */
export const APPLICATION_STATUSES = ['applied', 'reviewing', 'shortlisted', 'rejected', 'hired'] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export interface Candidate {
  id: string
  externalId?: string
  fullName: string
  email: string
  phone: string
  jobOpeningId: string
  jobTitle: string
  linkedinUrl?: string
  experienceYears?: number
  resumeKey?: string
  resumeFileName?: string
  status: ApplicationStatus
  appliedAt?: string
}

interface RawCandidate extends Omit<Candidate, 'id' | 'jobTitle'> {
  _id: string
  jobTitle?: string
}

export async function fetchCandidates(): Promise<Candidate[]> {
  const res = await fetch('/api/candidates')
  if (!res.ok) throw new Error(`Failed to load candidates (${res.status})`)
  const body = (await res.json()) as { data: RawCandidate[] }
  return body.data.map(({ _id, jobTitle, ...rest }) => ({ id: _id, jobTitle: jobTitle ?? 'Unknown', ...rest }))
}

export interface CreateCandidateInput {
  fullName: string
  email: string
  phone: string
  jobOpeningId: string
  linkedinUrl?: string
  experienceYears?: number
  resumeFileName?: string
}

export async function createCandidate(input: CreateCandidateInput): Promise<Candidate> {
  const res = await fetch('/api/candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `Failed to submit application (${res.status})`)
  const { _id, ...rest } = body as RawCandidate
  return { id: _id, ...rest, jobTitle: '' }
}

export async function updateCandidateStatus(id: string, status: ApplicationStatus): Promise<void> {
  const res = await fetch(`/api/candidates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to update candidate (${res.status})`)
  }
}

export async function fetchResumeUrl(candidateId: string): Promise<string> {
  const res = await fetch(`/api/candidates/${candidateId}/resume-url`)
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `Failed to get resume link (${res.status})`)
  return body.url as string
}

export interface Interview {
  id: string
  candidateId: string
  candidateName: string
  interviewerId?: string
  interviewerName?: string | null
  interviewDate?: string
  round?: string
  recommendation?: number
  strengths?: string
  concerns?: string
}

interface RawInterview extends Omit<Interview, 'id'> {
  _id: string
}

export async function fetchInterviews(): Promise<Interview[]> {
  const res = await fetch('/api/interviews')
  if (!res.ok) throw new Error(`Failed to load interviews (${res.status})`)
  const body = (await res.json()) as { data: RawInterview[] }
  return body.data.map(({ _id, ...rest }) => ({ id: _id, ...rest }))
}

export interface ScheduleInterviewInput {
  candidateId: string
  interviewerId?: string
  round?: string
  interviewDate?: string
}

export async function createInterview(input: ScheduleInterviewInput): Promise<void> {
  const res = await fetch('/api/interviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to schedule interview (${res.status})`)
  }
}

export interface UpdateInterviewInput {
  interviewerId?: string
  round?: string
  interviewDate?: string
  recommendation?: number
  strengths?: string
  concerns?: string
}

export async function updateInterview(id: string, input: UpdateInterviewInput): Promise<void> {
  const res = await fetch(`/api/interviews/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to update interview (${res.status})`)
  }
}

export async function deleteInterview(id: string): Promise<void> {
  const res = await fetch(`/api/interviews/${id}`, { method: 'DELETE' })
  if (res.ok) return
  const body = await res.json().catch(() => null)
  throw new Error(body?.error ?? `Failed to delete interview (${res.status})`)
}

export interface Offer {
  id: string
  candidateId: string
  candidateName: string
  status: number
  offeredAmount?: number
  sentDate?: string
  expiryDate?: string
  answeredDate?: string
  startDate?: string
  notes?: string
}

interface RawOffer extends Omit<Offer, 'id'> {
  _id: string
}

export async function fetchOffers(): Promise<Offer[]> {
  const res = await fetch('/api/offers')
  if (!res.ok) throw new Error(`Failed to load offers (${res.status})`)
  const body = (await res.json()) as { data: RawOffer[] }
  return body.data.map(({ _id, ...rest }) => ({ id: _id, ...rest }))
}

/** Shortlisted AND at least one positive interview on file, and no offer yet — see backend/src/routes/offers.route.ts. */
export async function fetchOfferEligibleCandidates(): Promise<Pick<Candidate, 'id' | 'fullName' | 'email'>[]> {
  const res = await fetch('/api/offers/eligible-candidates')
  if (!res.ok) throw new Error(`Failed to load eligible candidates (${res.status})`)
  const body = (await res.json()) as { data: { _id: string; fullName: string; email: string }[] }
  return body.data.map(({ _id, ...rest }) => ({ id: _id, ...rest }))
}

export interface CreateOfferInput {
  candidateId: string
  offeredAmount?: number
  expiryDate?: string
}

export async function createOffer(input: CreateOfferInput): Promise<void> {
  const res = await fetch('/api/offers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to create offer (${res.status})`)
  }
}

export interface UpdateOfferInput {
  status?: number
  offeredAmount?: number
  sentDate?: string
  expiryDate?: string
  answeredDate?: string
  startDate?: string
  notes?: string
}

export async function updateOffer(id: string, input: UpdateOfferInput): Promise<void> {
  const res = await fetch(`/api/offers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to update offer (${res.status})`)
  }
}

export async function deleteOffer(id: string): Promise<void> {
  const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' })
  if (res.ok) return
  const body = await res.json().catch(() => null)
  throw new Error(body?.error ?? `Failed to delete offer (${res.status})`)
}

export interface BackgroundCheck {
  id: string
  teamMemberId: string
  memberName?: string
  status: number
  outcome?: number
  provider?: string
  consentReceived: boolean
  consentDate?: string
  initiatedDate?: string
  dueDate?: string
  notes?: string
}

interface RawBackgroundCheck extends Omit<BackgroundCheck, 'id'> {
  _id: string
}

export async function fetchBackgroundChecks(): Promise<BackgroundCheck[]> {
  const res = await fetch('/api/background-checks')
  if (!res.ok) throw new Error(`Failed to load background checks (${res.status})`)
  const body = (await res.json()) as { data: RawBackgroundCheck[] }
  return body.data.map(({ _id, ...rest }) => ({ id: _id, ...rest }))
}

export interface CreateBackgroundCheckInput {
  teamMemberId: string
  provider?: string
  dueDate?: string
}

export async function createBackgroundCheck(input: CreateBackgroundCheckInput): Promise<void> {
  const res = await fetch('/api/background-checks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to create background check (${res.status})`)
  }
}

export interface UpdateBackgroundCheckInput {
  status?: number
  outcome?: number
  provider?: string
  consentReceived?: boolean
  consentDate?: string
  initiatedDate?: string
  dueDate?: string
  notes?: string
}

export async function updateBackgroundCheck(id: string, input: UpdateBackgroundCheckInput): Promise<void> {
  const res = await fetch(`/api/background-checks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to update background check (${res.status})`)
  }
}

export async function deleteBackgroundCheck(id: string): Promise<void> {
  const res = await fetch(`/api/background-checks/${id}`, { method: 'DELETE' })
  if (res.ok) return
  const body = await res.json().catch(() => null)
  throw new Error(body?.error ?? `Failed to delete background check (${res.status})`)
}

export interface DocumentRecord {
  id: string
  teamMemberId: string
  memberName?: string
  documentType: number
  status: number
  neededBy?: string
  collectedDate?: string
  expiryDate?: string
  sentForSignature?: string
  signatureMethod?: string
  signedDate?: string
  verified: boolean
  fileName?: string
  fileMimeType?: string
  fileSize?: number
  fileUploadedAt?: string
}

interface RawDocument extends Omit<DocumentRecord, 'id'> {
  _id: string
}

export async function fetchDocuments(): Promise<DocumentRecord[]> {
  const res = await fetch('/api/documents')
  if (!res.ok) throw new Error(`Failed to load documents (${res.status})`)
  const body = (await res.json()) as { data: RawDocument[] }
  return body.data.map(({ _id, ...rest }) => ({ id: _id, ...rest }))
}

export interface CreateDocumentInput {
  teamMemberId: string
  documentType: number
  neededBy?: string
}

export async function createDocument(input: CreateDocumentInput): Promise<void> {
  const res = await fetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to create document (${res.status})`)
  }
}

export interface UpdateDocumentInput {
  documentType?: number
  status?: number
  neededBy?: string
  collectedDate?: string
  expiryDate?: string
  sentForSignature?: string
  signatureMethod?: string
  signedDate?: string
  verified?: boolean
}

export async function updateDocument(id: string, input: UpdateDocumentInput): Promise<void> {
  const res = await fetch(`/api/documents/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to update document (${res.status})`)
  }
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
  if (res.ok) return
  const body = await res.json().catch(() => null)
  throw new Error(body?.error ?? `Failed to delete document (${res.status})`)
}

export async function uploadDocumentFile(id: string, file: File): Promise<void> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`/api/documents/${id}/file`, { method: 'POST', body: form })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to upload file (${res.status})`)
  }
}

export function documentFileUrl(id: string): string {
  return `/api/documents/${id}/file`
}

export interface MintedLink {
  id: string
  formKey: string
  subjectId: string
  subjectLabel: string
  token: string
  expiresAt: string
  createdAt: string
}

export async function fetchMintedLinks(): Promise<MintedLink[]> {
  const res = await fetch('/api/links')
  if (!res.ok) throw new Error(`Failed to load recent links (${res.status})`)
  const body = (await res.json()) as { data: MintedLink[] }
  return body.data
}

export interface MintLinkInput {
  formKey: string
  subjectId: string
  subjectLabel: string
  expiryDays: number
}

export async function mintLink(input: MintLinkInput): Promise<MintedLink> {
  const res = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `Failed to mint link (${res.status})`)
  return body as MintedLink
}

export type VerifiedLink =
  | { ok: true; payload: { formKey: string; subjectId: string; subjectLabel: string; exp: number } }
  | { ok: false; reason: 'malformed' | 'tampered' | 'expired' }

export async function verifyLinkToken(token: string): Promise<VerifiedLink> {
  const res = await fetch(`/api/links/${encodeURIComponent(token)}/verify`)
  return (await res.json()) as VerifiedLink
}
