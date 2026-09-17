import { useEffect, useState, type FormEvent } from 'react'
import { choiceLabel, RECOMMENDATION } from '@shared/optionSets'
import {
  createInterview,
  deleteInterview,
  fetchCandidates,
  fetchInterviews,
  fetchTeamMembers,
  updateInterview,
  type Candidate,
  type Interview,
  type TeamMember,
} from '../../lib/api'
import { recommendationTone } from '../../lib/statusTone'
import { PageHeader, StatusPill } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'
import { Modal } from '../../components/Modal'
import { CloseIcon } from '../../components/icons'

export default function InterviewsPage() {
  const [rows, setRows] = useState<Interview[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [editing, setEditing] = useState<Interview | null>(null)
  const [deleting, setDeleting] = useState<Interview | null>(null)

  function reload() {
    fetchInterviews()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load interviews'))
  }

  useEffect(reload, [])

  const columns: Column<Interview>[] = [
    { key: 'candidate', label: 'Candidate', render: (r) => r.candidateName },
    { key: 'interviewer', label: 'Interviewer', render: (r) => r.interviewerName ?? '—' },
    { key: 'round', label: 'Round', render: (r) => r.round ?? '—' },
    { key: 'date', label: 'When', render: (r) => (r.interviewDate ? new Date(r.interviewDate).toLocaleDateString() : '—') },
    {
      key: 'verdict',
      label: 'Verdict',
      render: (r) =>
        r.recommendation === undefined ? (
          <StatusPill tone="neutral">Not yet given</StatusPill>
        ) : (
          <StatusPill tone={recommendationTone(r.recommendation)}>{choiceLabel(RECOMMENDATION, r.recommendation)}</StatusPill>
        ),
    },
    { key: 'strengths', label: 'What Was Good', render: (r) => r.strengths ?? '—' },
    { key: 'concerns', label: 'What Worried You', render: (r) => r.concerns ?? '—' },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary-light btn-sm" onClick={() => setEditing(r)}>
            Edit
          </button>
          <button className="btn btn-secondary-light btn-sm" style={{ color: 'var(--danger-fg)' }} onClick={() => setDeleting(r)}>
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Interviews"
        subtitle="Verdicts and written feedback per round."
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setShowSchedule(true)}>
            Schedule Interview
          </button>
        }
      />
      {error && <p className="error">{error}</p>}
      <DataTable columns={columns} rows={rows} emptyText="No interviews yet." />

      {showSchedule && (
        <ScheduleInterviewModal
          onClose={() => setShowSchedule(false)}
          onScheduled={() => {
            setShowSchedule(false)
            reload()
          }}
        />
      )}

      {editing && (
        <EditInterviewModal
          interview={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            reload()
          }}
        />
      )}

      {deleting && (
        <Modal onClose={() => setDeleting(null)}>
          <button className="modal-close" onClick={() => setDeleting(null)} aria-label="Close">
            <CloseIcon style={{ width: 16, height: 16 }} />
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete this interview?</h2>
          <p className="help" style={{ marginBottom: 20 }}>
            {deleting.candidateName}'s {deleting.round ?? ''} interview record will be removed permanently.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary-light" style={{ flex: 1 }} onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, background: 'var(--danger-fg)' }}
              onClick={() => {
                void deleteInterview(deleting.id).then(() => {
                  setDeleting(null)
                  reload()
                })
              }}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

function ScheduleInterviewModal({ onClose, onScheduled }: { onClose: () => void; onScheduled: () => void }) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [candidateId, setCandidateId] = useState('')
  const [interviewerId, setInterviewerId] = useState('')
  const [round, setRound] = useState('')
  const [interviewDate, setInterviewDate] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only candidates who've been shortlisted are eligible for scheduling —
    // matches the real pipeline (Applied → Reviewing → Shortlisted → Interview).
    void fetchCandidates().then((all) => setCandidates(all.filter((c) => c.status === 'shortlisted')))
    void fetchTeamMembers().then(setTeamMembers)
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!candidateId) {
      setError('Choose a candidate.')
      return
    }
    setPending(true)
    try {
      await createInterview({
        candidateId,
        interviewerId: interviewerId || undefined,
        round: round || undefined,
        interviewDate: interviewDate || undefined,
      })
      onScheduled()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule interview.')
      setPending(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon style={{ width: 16, height: 16 }} />
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Schedule Interview</h2>
      <form className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
        <div className="field">
          <label htmlFor="candidateId">Candidate</label>
          <select
            id="candidateId"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            disabled={candidates.length === 0}
          >
            <option value="" disabled>
              {candidates.length === 0 ? 'No shortlisted candidates' : 'Choose one'}
            </option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} — {c.jobTitle}
              </option>
            ))}
          </select>
          {candidates.length === 0 && (
            <p className="help">Nobody is currently Shortlisted. Move a candidate to that status first.</p>
          )}
        </div>
        <div className="field">
          <label htmlFor="interviewerId">Interviewer</label>
          <select id="interviewerId" value={interviewerId} onChange={(e) => setInterviewerId(e.target.value)}>
            <option value="">None yet</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="round">Round</label>
          <input id="round" type="text" placeholder="e.g. Technical, Final" value={round} onChange={(e) => setRound(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="interviewDate">When</label>
          <input id="interviewDate" type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} />
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={pending || candidates.length === 0}>
          {pending ? 'Scheduling…' : 'Schedule Interview'}
        </button>
      </form>
    </Modal>
  )
}

function EditInterviewModal({
  interview,
  onClose,
  onSaved,
}: {
  interview: Interview
  onClose: () => void
  onSaved: () => void
}) {
  const [round, setRound] = useState(interview.round ?? '')
  const [strengths, setStrengths] = useState(interview.strengths ?? '')
  const [concerns, setConcerns] = useState(interview.concerns ?? '')
  const [recommendation, setRecommendation] = useState(
    interview.recommendation === undefined ? '' : String(interview.recommendation),
  )
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await updateInterview(interview.id, {
        round,
        strengths,
        concerns,
        recommendation: recommendation === '' ? undefined : Number(recommendation),
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update interview.')
      setPending(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon style={{ width: 16, height: 16 }} />
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{interview.candidateName}</h2>
      <p className="help" style={{ marginBottom: 20 }}>
        Record the verdict and feedback for this round.
      </p>
      <form className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
        <div className="field">
          <label htmlFor="editRound">Round</label>
          <input id="editRound" type="text" value={round} onChange={(e) => setRound(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="strengths">What Was Good</label>
          <textarea id="strengths" value={strengths} onChange={(e) => setStrengths(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="concerns">What Worried You</label>
          <textarea id="concerns" value={concerns} onChange={(e) => setConcerns(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="recommendation">Verdict</label>
          <select id="recommendation" value={recommendation} onChange={(e) => setRecommendation(e.target.value)}>
            <option value="">Not yet given</option>
            {RECOMMENDATION.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save Feedback'}
        </button>
      </form>
    </Modal>
  )
}
