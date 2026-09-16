/**
 * Stands in for the Azure Function + Dataverse described in the handover doc
 * (`/api/apply`, `/api/form/<token>` — see docs/deploy-forms.md). Nothing is
 * deployed to Azure yet, so this module holds the same shape of data in
 * memory + localStorage instead. Swap the function bodies below for real
 * `fetch()` calls once the Function App exists; callers already await them.
 */

const STORAGE_KEY = 'briqbi-hr-mock-v1'
const NETWORK_DELAY_MS = 260

export interface TeamMember {
  id: string
  memberId: string // EMP-1001 style, from the assign-member-id flow
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

export interface JobOpening {
  id: string
  jobOpeningId: string // JR-1001
  roleTitle: string
  department: number
  positions: number
  status: number
}

export interface Candidate {
  id: string
  fullName: string
  email: string
  phone: string
  jobOpeningId: string
  candidateStage: number
}

export interface DocumentRow {
  id: string
  teamMemberId: string
  documentType: number
  status: number
  neededBy?: string
  collectedDate?: string
}

export interface BackgroundCheck {
  id: string
  teamMemberId: string
  status: number
  consentReceived: boolean
  consentDate?: string
  notes?: string
}

export interface AssetRow {
  id: string
  teamMemberId: string
  assetType: number
  status: number
  serialNumber?: string
  conditionAtIssue?: string
}

export interface OfferRow {
  id: string
  candidateId: string
  status: number
  offeredAmount: number
  offerExpiry: string
  startDate?: string
}

export interface InterviewRow {
  id: string
  candidateId: string
  round?: string
  strengths?: string
  concerns?: string
  recommendation?: number
}

export interface JoiningTaskRow {
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

export interface TrainingRecordRow {
  id: string
  teamMemberId: string
  trainingType: number
  trainingStatus: number
  provider?: string
  completedDate?: string
  expiryDate?: string
}

export interface MintedLink {
  token: string
  formKey: string
  subjectId: string
  subjectLabel: string
  createdAt: string
  expiresAt: string
}

interface Store {
  teamMembers: TeamMember[]
  jobOpenings: JobOpening[]
  candidates: Candidate[]
  documents: DocumentRow[]
  backgroundChecks: BackgroundCheck[]
  assets: AssetRow[]
  offers: OfferRow[]
  interviews: InterviewRow[]
  joiningTasks: JoiningTaskRow[]
  trainingRecords: TrainingRecordRow[]
  links: MintedLink[]
}

function seed(): Store {
  return {
    teamMembers: [
      {
        id: 'tm-1',
        memberId: 'EMP-1001',
        fullName: 'Ananya Rao',
        personType: 0,
        memberStatus: 1,
        onboardingStage: 6,
        department: 0,
        workEmail: 'ananya.rao@briqbi.com',
        bgvOverdue: false,
      },
      {
        id: 'tm-2',
        memberId: 'CON-1002',
        fullName: 'Karthik Iyer',
        personType: 1,
        memberStatus: 0,
        onboardingStage: 1,
        department: 1,
        workEmail: 'karthik.iyer@briqbi.com',
        bgvOverdue: false,
      },
      {
        id: 'tm-3',
        memberId: 'INT-1003',
        fullName: 'Priya Sharma',
        personType: 2,
        memberStatus: 2,
        onboardingStage: 6,
        department: 4,
        workEmail: 'priya.sharma@briqbi.com',
        bgvOverdue: false,
      },
    ],
    jobOpenings: [
      { id: 'jo-1', jobOpeningId: 'JR-1001', roleTitle: 'Frontend Engineer', department: 0, positions: 1, status: 0 },
      { id: 'jo-2', jobOpeningId: 'JR-1002', roleTitle: 'Delivery Consultant', department: 1, positions: 1, status: 2 },
    ],
    candidates: [
      {
        id: 'cand-1',
        fullName: 'Rohan Mehta',
        email: 'rohan.mehta@example.com',
        phone: '+91 90000 11111',
        jobOpeningId: 'jo-1',
        candidateStage: 2,
      },
      {
        id: 'cand-2',
        fullName: 'Fatima Sheikh',
        email: 'fatima.sheikh@example.com',
        phone: '+91 90000 22222',
        jobOpeningId: 'jo-2',
        candidateStage: 3,
      },
    ],
    documents: [
      { id: 'doc-1', teamMemberId: 'tm-2', documentType: 0, status: 0, neededBy: '2026-09-20' },
      { id: 'doc-2', teamMemberId: 'tm-2', documentType: 1, status: 0, neededBy: '2026-09-20' },
      { id: 'doc-3', teamMemberId: 'tm-2', documentType: 9, status: 0, neededBy: '2026-09-20' },
      { id: 'doc-4', teamMemberId: 'tm-2', documentType: 7, status: 1, collectedDate: '2026-09-05' },
      { id: 'doc-5', teamMemberId: 'tm-2', documentType: 19, status: 0, neededBy: '2026-09-20' },
    ],
    backgroundChecks: [
      { id: 'bgv-1', teamMemberId: 'tm-2', status: 0, consentReceived: false },
      { id: 'bgv-2', teamMemberId: 'tm-1', status: 3, consentReceived: true, consentDate: '2025-11-02' },
    ],
    assets: [
      { id: 'asset-1', teamMemberId: 'tm-2', assetType: 0, status: 0, serialNumber: 'BRQ-LT-2231' },
      { id: 'asset-2', teamMemberId: 'tm-3', assetType: 3, status: 1, serialNumber: 'BRQ-AC-0087' },
    ],
    offers: [
      { id: 'offer-1', candidateId: 'cand-2', status: 1, offeredAmount: 95000, offerExpiry: '2026-09-22' },
    ],
    interviews: [{ id: 'int-1', candidateId: 'cand-1', round: 'Technical' }],
    joiningTasks: [
      {
        id: 'task-1',
        teamMemberId: 'tm-2',
        stage: 0,
        status: 2,
        mustDo: true,
        responsible: 'HR',
        sequence: 1,
        dueDate: '2026-09-15',
        completedDate: '2026-09-10',
      },
      {
        id: 'task-2',
        teamMemberId: 'tm-2',
        stage: 1,
        status: 1,
        mustDo: true,
        responsible: 'IT',
        sequence: 2,
        dueDate: '2026-09-19',
      },
      {
        id: 'task-3',
        teamMemberId: 'tm-2',
        stage: 2,
        status: 0,
        mustDo: true,
        responsible: 'Manager',
        sequence: 3,
        dueDate: '2026-09-21',
      },
      {
        id: 'task-4',
        teamMemberId: 'tm-2',
        stage: 2,
        status: 0,
        mustDo: false,
        responsible: 'HR',
        sequence: 4,
        dueDate: '2026-09-21',
      },
      {
        id: 'task-5',
        teamMemberId: 'tm-1',
        stage: 6,
        status: 2,
        mustDo: true,
        responsible: 'HR',
        sequence: 1,
        completedDate: '2025-11-20',
      },
    ],
    trainingRecords: [
      {
        id: 'train-1',
        teamMemberId: 'tm-1',
        trainingType: 0,
        trainingStatus: 2,
        provider: 'Internal',
        completedDate: '2025-12-01',
      },
      {
        id: 'train-2',
        teamMemberId: 'tm-1',
        trainingType: 1,
        trainingStatus: 4,
        provider: 'Microsoft',
        completedDate: '2025-01-15',
        expiryDate: '2026-10-01',
      },
      {
        id: 'train-3',
        teamMemberId: 'tm-2',
        trainingType: 0,
        trainingStatus: 0,
        provider: 'Internal',
      },
    ],
    links: [],
  }
}

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Store
  } catch {
    // ignore corrupt storage, fall through to reseed
  }
  const fresh = seed()
  save(fresh)
  return fresh
}

function save(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // storage unavailable (private mode, quota) — mock data just won't persist
  }
}

let store = load()

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY_MS))
}

function commit() {
  save(store)
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  return delay(store.teamMembers)
}

export async function getTeamMember(id: string): Promise<TeamMember | undefined> {
  return delay(store.teamMembers.find((m) => m.id === id))
}

export async function listCandidates(): Promise<Candidate[]> {
  return delay(store.candidates)
}

export async function getCandidate(id: string): Promise<Candidate | undefined> {
  return delay(store.candidates.find((c) => c.id === id))
}

export async function listJobOpenings(): Promise<JobOpening[]> {
  return delay(store.jobOpenings.filter((j) => j.status === 0 || j.status === 2))
}

export async function documentsFor(teamMemberId: string): Promise<DocumentRow[]> {
  return delay(store.documents.filter((d) => d.teamMemberId === teamMemberId))
}

export async function backgroundCheckFor(teamMemberId: string): Promise<BackgroundCheck | undefined> {
  return delay(store.backgroundChecks.find((b) => b.teamMemberId === teamMemberId))
}

export async function assetsFor(teamMemberId: string): Promise<AssetRow[]> {
  return delay(store.assets.filter((a) => a.teamMemberId === teamMemberId))
}

export async function offerFor(candidateId: string): Promise<OfferRow | undefined> {
  return delay(store.offers.find((o) => o.candidateId === candidateId))
}

export async function interviewFor(candidateId: string): Promise<InterviewRow | undefined> {
  return delay(store.interviews.find((i) => i.candidateId === candidateId))
}

function memberName(id: string): string {
  return store.teamMembers.find((m) => m.id === id)?.fullName ?? 'Unknown'
}

function candidateName(id: string): string {
  return store.candidates.find((c) => c.id === id)?.fullName ?? 'Unknown'
}

function jobTitle(id: string): string {
  return store.jobOpenings.find((j) => j.id === id)?.roleTitle ?? 'Unknown'
}

/** Dashboard list views — every table gets one, denormalized the way a real API response would be. */

export async function listAllDocuments(): Promise<(DocumentRow & { memberName: string })[]> {
  return delay(store.documents.map((d) => ({ ...d, memberName: memberName(d.teamMemberId) })))
}

export async function listAllBackgroundChecks(): Promise<(BackgroundCheck & { memberName: string })[]> {
  return delay(store.backgroundChecks.map((b) => ({ ...b, memberName: memberName(b.teamMemberId) })))
}

export async function listAllAssets(): Promise<(AssetRow & { memberName: string })[]> {
  return delay(store.assets.map((a) => ({ ...a, memberName: memberName(a.teamMemberId) })))
}

export async function listAllJoiningTasks(): Promise<(JoiningTaskRow & { memberName: string })[]> {
  return delay(store.joiningTasks.map((t) => ({ ...t, memberName: memberName(t.teamMemberId) })))
}

export async function listAllTrainingRecords(): Promise<(TrainingRecordRow & { memberName: string })[]> {
  return delay(store.trainingRecords.map((t) => ({ ...t, memberName: memberName(t.teamMemberId) })))
}

export async function listAllInterviews(): Promise<(InterviewRow & { candidateName: string })[]> {
  return delay(store.interviews.map((i) => ({ ...i, candidateName: candidateName(i.candidateId) })))
}

export async function listAllOffers(): Promise<(OfferRow & { candidateName: string })[]> {
  return delay(store.offers.map((o) => ({ ...o, candidateName: candidateName(o.candidateId) })))
}

export async function listAllCandidates(): Promise<(Candidate & { jobTitle: string })[]> {
  return delay(store.candidates.map((c) => ({ ...c, jobTitle: jobTitle(c.jobOpeningId) })))
}

export async function listAllJobOpenings(): Promise<JobOpening[]> {
  return delay(store.jobOpenings)
}

export interface ApplyInput {
  fullName: string
  email: string
  phone: string
  jobOpeningId: string
  linkedin?: string
  location?: string
  experienceYears?: number
  currentPay?: number
  expectedPay?: number
  noticePeriod?: string
  source?: number
  cvFileName?: string
}

export async function submitCandidateStage(candidateId: string, stage: number): Promise<void> {
  const candidate = store.candidates.find((c) => c.id === candidateId)
  if (candidate) candidate.candidateStage = stage
  commit()
  return delay(undefined)
}

export async function submitApplication(input: ApplyInput): Promise<Candidate> {
  const candidate: Candidate = {
    id: `cand-${store.candidates.length + 1}-${Date.now()}`,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    jobOpeningId: input.jobOpeningId,
    candidateStage: 0,
  }
  store.candidates.push(candidate)
  commit()
  return delay(candidate)
}

export async function submitJoiner(
  teamMemberId: string,
  data: { personalEmail: string; phone: string; emergencyContact: string; pan: string; bankAccountRef: string },
): Promise<void> {
  const member = store.teamMembers.find((m) => m.id === teamMemberId)
  if (member) Object.assign(member, data)
  commit()
  return delay(undefined)
}

export async function submitConsent(
  teamMemberId: string,
  data: { consentReceived: boolean; notes?: string },
): Promise<void> {
  const check = store.backgroundChecks.find((b) => b.teamMemberId === teamMemberId)
  if (check) {
    check.consentReceived = data.consentReceived
    check.consentDate = new Date().toISOString().slice(0, 10)
    check.notes = data.notes
    check.status = 1
  }
  commit()
  return delay(undefined)
}

export async function submitPolicyAck(teamMemberId: string): Promise<void> {
  const doc = store.documents.find((d) => d.teamMemberId === teamMemberId && d.documentType === 19)
  if (doc) {
    doc.status = 3
    doc.collectedDate = new Date().toISOString().slice(0, 10)
  }
  commit()
  return delay(undefined)
}

export async function submitDocumentUpload(documentId: string): Promise<void> {
  const doc = store.documents.find((d) => d.id === documentId)
  if (doc) {
    doc.status = 1
    doc.collectedDate = new Date().toISOString().slice(0, 10)
  }
  commit()
  return delay(undefined)
}

export async function submitAssetReceipt(assetId: string, condition: string): Promise<void> {
  const asset = store.assets.find((a) => a.id === assetId)
  if (asset) {
    asset.status = 1
    asset.conditionAtIssue = condition
  }
  commit()
  return delay(undefined)
}

export async function submitOfferResponse(
  offerId: string,
  data: { accepted: boolean; startDate?: string },
): Promise<void> {
  const offer = store.offers.find((o) => o.id === offerId)
  if (offer) {
    offer.status = data.accepted ? 3 : 4
    offer.startDate = data.startDate
  }
  commit()
  return delay(undefined)
}

export async function submitInterviewFeedback(
  candidateId: string,
  data: { round: string; strengths?: string; concerns?: string; recommendation: number },
): Promise<void> {
  const interview = store.interviews.find((i) => i.candidateId === candidateId)
  if (interview) Object.assign(interview, data)
  commit()
  return delay(undefined)
}

export async function submitReference(
  teamMemberId: string,
  data: { referenceNotes: string; wouldRehire?: number },
): Promise<void> {
  const check = store.backgroundChecks.find((b) => b.teamMemberId === teamMemberId)
  if (check) {
    const stamp = new Date().toISOString().slice(0, 10)
    const line = `[${stamp}] Reference: ${data.referenceNotes}`
    check.notes = check.notes ? `${check.notes}\n${line}` : line
  }
  commit()
  return delay(undefined)
}

export async function submitExit(
  teamMemberId: string,
  data: { exitReason: string; lastWorkingDay: string },
): Promise<void> {
  const member = store.teamMembers.find((m) => m.id === teamMemberId)
  if (member) {
    member.memberStatus = 3
    member.exitReason = data.exitReason
    member.lastWorkingDay = data.lastWorkingDay
  }
  store.assets
    .filter((a) => a.teamMemberId === teamMemberId && a.status === 1)
    .forEach((a) => {
      a.status = 2
    })
  commit()
  return delay(undefined)
}

export interface MintLinkInput {
  formKey: string
  subjectId: string
  subjectLabel: string
  expiryDays: number
}

export async function mintLink(input: MintLinkInput): Promise<MintedLink> {
  const now = Date.now()
  const link: MintedLink = {
    token: '', // filled by caller using lib/linkToken, then persisted via recordLink
    formKey: input.formKey,
    subjectId: input.subjectId,
    subjectLabel: input.subjectLabel,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + input.expiryDays * 24 * 60 * 60 * 1000).toISOString(),
  }
  return delay(link)
}

export async function recordLink(link: MintedLink): Promise<void> {
  store.links.unshift(link)
  store.links = store.links.slice(0, 30)
  commit()
  return delay(undefined)
}

export async function listMintedLinks(): Promise<MintedLink[]> {
  return delay(store.links)
}
