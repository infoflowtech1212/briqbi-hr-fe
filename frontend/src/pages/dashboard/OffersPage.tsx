import { useEffect, useState, type FormEvent } from 'react'
import { choiceLabel, OFFER_STATUS } from '@shared/optionSets'
import {
  createOffer,
  deleteOffer,
  fetchOfferEligibleCandidates,
  fetchOffers,
  updateOffer,
  type Candidate,
  type Offer,
} from '../../lib/api'
import { offerStatusTone } from '../../lib/statusTone'
import { PageHeader, StatusPill } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'
import { FilterBar } from '../../components/FilterBar'
import { Pagination } from '../../components/Pagination'
import { usePagination } from '../../lib/usePagination'
import { Modal } from '../../components/Modal'
import { CloseIcon } from '../../components/icons'

export default function OffersPage() {
  const [rows, setRows] = useState<Offer[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Offer | null>(null)
  const [deleting, setDeleting] = useState<Offer | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  function reload() {
    fetchOffers()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load offers'))
  }

  useEffect(reload, [])

  const filtered = (rows ?? []).filter((r) => {
    if (search && !r.candidateName.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== '' && r.status !== Number(statusFilter)) return false
    return true
  })
  const { pageRows, page, setPage, totalPages } = usePagination(filtered, 10)

  const columns: Column<Offer>[] = [
    { key: 'candidate', label: 'Candidate', render: (r) => r.candidateName },
    {
      key: 'amount',
      label: 'Amount',
      render: (r) => (r.offeredAmount === undefined ? '—' : <span className="mono">₹{r.offeredAmount.toLocaleString('en-IN')}</span>),
    },
    { key: 'expiry', label: 'Expires', render: (r) => (r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '—') },
    { key: 'start', label: 'Start Date', render: (r) => (r.startDate ? new Date(r.startDate).toLocaleDateString() : '—') },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusPill tone={offerStatusTone(r.status)}>{choiceLabel(OFFER_STATUS, r.status)}</StatusPill>,
    },
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
        title="Offers"
        subtitle="Amount, expiry, and the candidate's answer."
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            Create Offer
          </button>
        }
      />
      {error && <p className="error">{error}</p>}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by candidate…"
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: OFFER_STATUS.map((c) => ({ value: String(c.value), label: c.label })),
          },
        ]}
      />
      <DataTable columns={columns} rows={rows === null ? null : pageRows} emptyText="No offers match." />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {showCreate && (
        <CreateOfferModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            reload()
          }}
        />
      )}

      {editing && (
        <EditOfferModal
          offer={editing}
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
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete this offer?</h2>
          <p className="help" style={{ marginBottom: 20 }}>
            {deleting.candidateName}'s offer record will be removed permanently.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary-light" style={{ flex: 1 }} onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, background: 'var(--danger-fg)' }}
              onClick={() => {
                void deleteOffer(deleting.id).then(() => {
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

function CreateOfferModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [candidates, setCandidates] = useState<Pick<Candidate, 'id' | 'fullName' | 'email'>[]>([])
  const [candidateId, setCandidateId] = useState('')
  const [offeredAmount, setOfferedAmount] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchOfferEligibleCandidates().then(setCandidates)
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
      await createOffer({
        candidateId,
        offeredAmount: offeredAmount === '' ? undefined : Number(offeredAmount),
        expiryDate: expiryDate || undefined,
      })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create offer.')
      setPending(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon style={{ width: 16, height: 16 }} />
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Create Offer</h2>
      <p className="help" style={{ marginBottom: 20 }}>
        Only candidates who are Shortlisted with a positive interview verdict on file, and don't already have an
        offer, show up here.
      </p>
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
              {candidates.length === 0 ? 'No eligible candidates' : 'Choose one'}
            </option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} — {c.email}
              </option>
            ))}
          </select>
          {candidates.length === 0 && (
            <p className="help">Nobody qualifies yet — shortlist a candidate and record a positive interview first.</p>
          )}
        </div>
        <div className="field">
          <label htmlFor="offeredAmount">Offered Amount</label>
          <div className="currency-input">
            <input id="offeredAmount" type="number" min={0} value={offeredAmount} onChange={(e) => setOfferedAmount(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="expiryDate">Expires</label>
          <input id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={pending || candidates.length === 0}>
          {pending ? 'Creating…' : 'Create Offer'}
        </button>
      </form>
    </Modal>
  )
}

function EditOfferModal({ offer, onClose, onSaved }: { offer: Offer; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState(String(offer.status))
  const [offeredAmount, setOfferedAmount] = useState(offer.offeredAmount === undefined ? '' : String(offer.offeredAmount))
  const [expiryDate, setExpiryDate] = useState(offer.expiryDate ? offer.expiryDate.slice(0, 10) : '')
  const [startDate, setStartDate] = useState(offer.startDate ? offer.startDate.slice(0, 10) : '')
  const [notes, setNotes] = useState(offer.notes ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await updateOffer(offer.id, {
        status: Number(status),
        offeredAmount: offeredAmount === '' ? undefined : Number(offeredAmount),
        expiryDate: expiryDate || undefined,
        startDate: startDate || undefined,
        notes,
        answeredDate: new Date().toISOString().slice(0, 10),
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update offer.')
      setPending(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon style={{ width: 16, height: 16 }} />
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{offer.candidateName}</h2>
      <form className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {OFFER_STATUS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="editOfferedAmount">Offered Amount</label>
          <div className="currency-input">
            <input
              id="editOfferedAmount"
              type="number"
              min={0}
              value={offeredAmount}
              onChange={(e) => setOfferedAmount(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="editExpiryDate">Expires</label>
          <input id="editExpiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="startDate">Start Date</label>
          <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <p className="help">Only relevant once accepted.</p>
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
