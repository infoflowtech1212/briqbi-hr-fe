import { useEffect, useState, type FormEvent } from 'react'
import { CHECK_OUTCOME, CHECK_STATUS, choiceLabel } from '@shared/optionSets'
import {
  createBackgroundCheck,
  deleteBackgroundCheck,
  fetchBackgroundChecks,
  fetchTeamMembers,
  updateBackgroundCheck,
  type BackgroundCheck,
  type TeamMember,
} from '../../lib/api'
import { checkOutcomeTone, checkStatusTone } from '../../lib/statusTone'
import { PageHeader, StatusPill } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'
import { FilterBar } from '../../components/FilterBar'
import { Pagination } from '../../components/Pagination'
import { usePagination } from '../../lib/usePagination'
import { Modal } from '../../components/Modal'
import { CloseIcon } from '../../components/icons'

export default function BackgroundChecksPage() {
  const [checks, setChecks] = useState<BackgroundCheck[] | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<BackgroundCheck | null>(null)
  const [deleting, setDeleting] = useState<BackgroundCheck | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  function reload() {
    Promise.all([fetchBackgroundChecks(), fetchTeamMembers()])
      .then(([c, m]) => {
        setChecks(c)
        setMembers(m)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load background checks'))
  }

  useEffect(reload, [])

  const filtered = (checks ?? []).filter((r) => {
    if (search && !(r.memberName ?? '').toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== '' && r.status !== Number(statusFilter)) return false
    return true
  })
  const { pageRows, page, setPage, totalPages } = usePagination(filtered, 10)

  const columns: Column<BackgroundCheck>[] = [
    { key: 'member', label: 'Person', render: (r) => r.memberName ?? 'Unknown' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusPill tone={checkStatusTone(r.status)}>{choiceLabel(CHECK_STATUS, r.status)}</StatusPill>,
    },
    {
      key: 'outcome',
      label: 'Result',
      render: (r) => (r.outcome === undefined ? '—' : <StatusPill tone={checkOutcomeTone(r.outcome)}>{choiceLabel(CHECK_OUTCOME, r.outcome)}</StatusPill>),
    },
    { key: 'provider', label: 'Provider', render: (r) => r.provider || '—' },
    { key: 'consent', label: 'Consent Signed', render: (r) => (r.consentReceived ? 'Yes' : 'No') },
    { key: 'due', label: 'Due', render: (r) => (r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—') },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary-light btn-sm" onClick={() => setEditing(r)}>
            Edit
          </button>
          <button
            className="btn btn-secondary-light btn-sm"
            style={{ color: 'var(--danger-fg)' }}
            onClick={() => setDeleting(r)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Background Checks"
        subtitle="briqbi_backgroundchecks — consent, provider, and outcome per person."
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)} disabled={members.length === 0}>
            Start Check
          </button>
        }
      />
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by person…"
            filters={[
              {
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: CHECK_STATUS.map((c) => ({ value: String(c.value), label: c.label })),
              },
            ]}
          />
          <DataTable columns={columns} rows={checks === null ? null : pageRows} emptyText="No background checks match." />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {showAdd && (
        <AddCheckModal
          members={members}
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false)
            reload()
          }}
        />
      )}

      {editing && (
        <EditCheckModal
          check={editing}
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
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete this check?</h2>
          <p className="help" style={{ marginBottom: 20 }}>
            This removes the background check record permanently. This can't be undone.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary-light" style={{ flex: 1 }} onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, background: 'var(--danger-fg)' }}
              onClick={() => {
                void deleteBackgroundCheck(deleting.id).then(() => {
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

function AddCheckModal({
  members,
  onClose,
  onCreated,
}: {
  members: TeamMember[]
  onClose: () => void
  onCreated: () => void
}) {
  const [teamMemberId, setTeamMemberId] = useState('')
  const [provider, setProvider] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!teamMemberId) {
      setError('Choose a person.')
      return
    }
    setPending(true)
    try {
      await createBackgroundCheck({
        teamMemberId,
        provider: provider || undefined,
        dueDate: dueDate || undefined,
      })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start background check.')
      setPending(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon style={{ width: 16, height: 16 }} />
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Start Background Check</h2>
      <form className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
        <div className="field">
          <label htmlFor="teamMemberId">Person</label>
          <select id="teamMemberId" value={teamMemberId} onChange={(e) => setTeamMemberId(e.target.value)}>
            <option value="" disabled>
              Choose one
            </option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="provider">Provider</label>
          <input id="provider" type="text" placeholder="e.g. IDfy, or Manual" value={provider} onChange={(e) => setProvider(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="dueDate">Due Date</label>
          <input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
          {pending ? 'Starting…' : 'Start Check'}
        </button>
      </form>
    </Modal>
  )
}

function EditCheckModal({
  check,
  onClose,
  onSaved,
}: {
  check: BackgroundCheck
  onClose: () => void
  onSaved: () => void
}) {
  const [status, setStatus] = useState(String(check.status))
  const [outcome, setOutcome] = useState(check.outcome === undefined ? '' : String(check.outcome))
  const [provider, setProvider] = useState(check.provider ?? '')
  const [consentReceived, setConsentReceived] = useState(check.consentReceived)
  const [consentDate, setConsentDate] = useState(check.consentDate ? check.consentDate.slice(0, 10) : '')
  const [initiatedDate, setInitiatedDate] = useState(check.initiatedDate ? check.initiatedDate.slice(0, 10) : '')
  const [dueDate, setDueDate] = useState(check.dueDate ? check.dueDate.slice(0, 10) : '')
  const [notes, setNotes] = useState(check.notes ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await updateBackgroundCheck(check.id, {
        status: Number(status),
        outcome: outcome === '' ? undefined : Number(outcome),
        provider: provider || undefined,
        consentReceived,
        consentDate: consentDate || undefined,
        initiatedDate: initiatedDate || undefined,
        dueDate: dueDate || undefined,
        notes,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update background check.')
      setPending(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon style={{ width: 16, height: 16 }} />
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{check.memberName ?? 'Background Check'}</h2>
      <form className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {CHECK_STATUS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="outcome">Result</label>
          <select id="outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
            <option value="">Not set</option>
            {CHECK_OUTCOME.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="provider">Provider</label>
          <input id="provider" type="text" placeholder="e.g. IDfy, or Manual" value={provider} onChange={(e) => setProvider(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="consentReceived">
            <input
              id="consentReceived"
              type="checkbox"
              checked={consentReceived}
              onChange={(e) => setConsentReceived(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Consent signed
          </label>
        </div>
        <div className="field">
          <label htmlFor="consentDate">Consent Date</label>
          <input id="consentDate" type="date" value={consentDate} onChange={(e) => setConsentDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="initiatedDate">Started</label>
          <input id="initiatedDate" type="date" value={initiatedDate} onChange={(e) => setInitiatedDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="dueDate">Due Date</label>
          <input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </Modal>
  )
}
