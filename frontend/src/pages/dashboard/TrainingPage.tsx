import { useEffect, useState, type FormEvent } from 'react'
import { choiceLabel, TRAINING_STATUS, TRAINING_TYPE } from '@shared/optionSets'
import {
  createTrainingRecord,
  deleteTrainingRecord,
  fetchTeamMembers,
  fetchTrainingRecords,
  updateTrainingRecord,
  type TeamMember,
  type TrainingRecord,
} from '../../lib/api'
import { trainingStatusTone } from '../../lib/statusTone'
import { PageHeader, StatusPill } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'
import { FilterBar } from '../../components/FilterBar'
import { Pagination } from '../../components/Pagination'
import { usePagination } from '../../lib/usePagination'
import { Modal } from '../../components/Modal'
import { CloseIcon } from '../../components/icons'

type Row = TrainingRecord & { memberName: string }

export default function TrainingPage() {
  const [records, setRecords] = useState<TrainingRecord[] | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<TrainingRecord | null>(null)
  const [deleting, setDeleting] = useState<TrainingRecord | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  function reload() {
    Promise.all([fetchTrainingRecords(), fetchTeamMembers()])
      .then(([r, m]) => {
        setRecords(r)
        setMembers(m)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load training records'))
  }

  useEffect(reload, [])

  function memberName(id: string): string {
    return members.find((m) => m.id === id)?.fullName ?? 'Unknown'
  }

  const rows: Row[] | null = records && records.map((r) => ({ ...r, memberName: memberName(r.teamMemberId) }))

  const filtered = (rows ?? []).filter((r) => {
    if (search && !r.memberName.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== '' && r.trainingType !== Number(typeFilter)) return false
    if (statusFilter !== '' && r.trainingStatus !== Number(statusFilter)) return false
    return true
  })
  const { pageRows, page, setPage, totalPages } = usePagination(filtered, 10)

  const columns: Column<Row>[] = [
    { key: 'member', label: 'Person', render: (r) => r.memberName },
    { key: 'type', label: 'Type', render: (r) => choiceLabel(TRAINING_TYPE, r.trainingType) },
    { key: 'provider', label: 'Provider', render: (r) => r.provider ?? '—' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <StatusPill tone={trainingStatusTone(r.trainingStatus)}>{choiceLabel(TRAINING_STATUS, r.trainingStatus)}</StatusPill>
      ),
    },
    { key: 'expires', label: 'Expires', render: (r) => r.expiryDate ?? '—' },
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
        title="Training"
        subtitle="briqbi_trainingrecords — required and certification training, with expiry tracked."
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)} disabled={members.length === 0}>
            Add Training Record
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
                label: 'Type',
                value: typeFilter,
                onChange: setTypeFilter,
                options: TRAINING_TYPE.map((c) => ({ value: String(c.value), label: c.label })),
              },
              {
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: TRAINING_STATUS.map((c) => ({ value: String(c.value), label: c.label })),
              },
            ]}
          />
          <DataTable columns={columns} rows={rows === null ? null : pageRows} emptyText="No training records match." />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {showAdd && (
        <TrainingRecordFormModal
          members={members}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false)
            reload()
          }}
        />
      )}

      {editing && (
        <TrainingRecordFormModal
          record={editing}
          members={members}
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
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Delete this {choiceLabel(TRAINING_TYPE, deleting.trainingType)} record?
          </h2>
          <p className="help" style={{ marginBottom: 20 }}>
            This removes the training record permanently. This can't be undone.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary-light" style={{ flex: 1 }} onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, background: 'var(--danger-fg)' }}
              onClick={() => {
                void deleteTrainingRecord(deleting.id).then(() => {
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

function TrainingRecordFormModal({
  record,
  members,
  onClose,
  onSaved,
}: {
  record?: TrainingRecord
  members: TeamMember[]
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = Boolean(record)
  const [teamMemberId, setTeamMemberId] = useState(record?.teamMemberId ?? '')
  const [trainingType, setTrainingType] = useState(record ? String(record.trainingType) : '')
  const [trainingStatus, setTrainingStatus] = useState(record ? String(record.trainingStatus) : '0')
  const [provider, setProvider] = useState(record?.provider ?? '')
  const [completedDate, setCompletedDate] = useState(record?.completedDate ?? '')
  const [expiryDate, setExpiryDate] = useState(record?.expiryDate ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!teamMemberId || trainingType === '') {
      setError('Person and type are required.')
      return
    }
    setPending(true)
    try {
      if (isEdit && record) {
        await updateTrainingRecord(record.id, {
          teamMemberId,
          trainingType: Number(trainingType),
          trainingStatus: Number(trainingStatus),
          provider: provider || undefined,
          completedDate: completedDate || undefined,
          expiryDate: expiryDate || undefined,
        })
      } else {
        await createTrainingRecord({
          teamMemberId,
          trainingType: Number(trainingType),
          provider: provider || undefined,
          completedDate: completedDate || undefined,
          expiryDate: expiryDate || undefined,
        })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save training record.')
      setPending(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon style={{ width: 16, height: 16 }} />
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        {isEdit ? 'Edit Training Record' : 'Add Training Record'}
      </h2>
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
          <label htmlFor="trainingType">Type</label>
          <select id="trainingType" value={trainingType} onChange={(e) => setTrainingType(e.target.value)}>
            <option value="" disabled>
              Choose one
            </option>
            {TRAINING_TYPE.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="provider">Provider</label>
          <input id="provider" type="text" value={provider} onChange={(e) => setProvider(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="completedDate">Completed Date</label>
          <input id="completedDate" type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="expiryDate">Expiry Date</label>
          <input id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </div>
        {isEdit && (
          <div className="field">
            <label htmlFor="trainingStatus">Status</label>
            <select id="trainingStatus" value={trainingStatus} onChange={(e) => setTrainingStatus(e.target.value)}>
              {TRAINING_STATUS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
          {pending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Training Record'}
        </button>
      </form>
    </Modal>
  )
}
