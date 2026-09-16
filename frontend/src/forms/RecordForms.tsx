import { useEffect, useState } from 'react'
import { choiceLabel, ASSET_STATUS, ASSET_TYPE, DOC_STATUS, DOC_TYPE, OFFER_STATUS } from '@shared/optionSets'
import {
  assetsFor,
  documentsFor,
  offerFor,
  submitAssetReceipt,
  submitDocumentUpload,
  submitOfferResponse,
  type AssetRow,
  type DocumentRow,
  type OfferRow,
} from '../lib/mockApi'
import { docStatusTone, assetStatusTone, offerStatusTone } from '../lib/statusTone'
import { StatusPill } from '../components/ui'

/** One line on why each document type is needed, per §5 "Document row." */
const DOC_REASON: Partial<Record<number, string>> = {
  0: 'Confirms your PAN for payroll and statutory filing.',
  1: 'Required for background verification.',
  9: 'Covers confidentiality and IP assignment.',
  19: "Confirms you've read the company policy.",
  7: 'Your signed engagement terms.',
}

export function DocumentsFormBody({ subjectId, onDone }: { subjectId: string; onDone: () => void }) {
  const [docs, setDocs] = useState<DocumentRow[] | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    void documentsFor(subjectId).then(setDocs)
  }, [subjectId])

  if (!docs) return <p className="help">Loading your document list…</p>

  const pending = docs.filter((d) => d.status === 0)
  const done = docs.filter((d) => d.status !== 0)

  async function markReceived(id: string) {
    setBusyId(id)
    await submitDocumentUpload(id)
    const fresh = await documentsFor(subjectId)
    setDocs(fresh)
    setBusyId(null)
    if (fresh.every((d) => d.status !== 0)) onDone()
  }

  if (pending.length === 0) {
    return <p className="help">Nothing outstanding on this record.</p>
  }

  return (
    <div className="form-grid">
      {pending.map((doc) => (
        <div className="record-row" key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14.5 }}>{choiceLabel(DOC_TYPE, doc.documentType)}</span>
              <StatusPill tone={docStatusTone(doc.status)}>{choiceLabel(DOC_STATUS, doc.status)}</StatusPill>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 4 }}>
              {DOC_REASON[doc.documentType] ?? 'On file before your joining checklist can close.'}
              {doc.neededBy && ` Needed by ${doc.neededBy}.`}
            </div>
          </div>
          <button className="btn btn-secondary-light btn-sm" onClick={() => void markReceived(doc.id)} disabled={busyId === doc.id}>
            {busyId === doc.id ? 'Uploading…' : 'Mark as received'}
          </button>
        </div>
      ))}
      {done.length > 0 && (
        <p className="help">{done.length} document{done.length === 1 ? '' : 's'} already on file, not shown here.</p>
      )}
    </div>
  )
}

export function AssetFormBody({ subjectId, onDone }: { subjectId: string; onDone: () => void }) {
  const [assets, setAssets] = useState<AssetRow[] | null>(null)
  const [conditions, setConditions] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    void assetsFor(subjectId).then(setAssets)
  }, [subjectId])

  if (!assets) return <p className="help">Loading your kit…</p>

  const awaiting = assets.filter((a) => a.status === 0)
  if (awaiting.length === 0) {
    return <p className="help">Nothing outstanding on this record.</p>
  }

  async function confirm(id: string) {
    setBusyId(id)
    await submitAssetReceipt(id, conditions[id] || 'Good')
    const fresh = await assetsFor(subjectId)
    setAssets(fresh)
    setBusyId(null)
    if (fresh.every((a) => a.status !== 0)) onDone()
  }

  return (
    <div className="form-grid">
      {awaiting.map((asset) => (
        <div className="record-row" key={asset.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14.5 }}>{choiceLabel(ASSET_TYPE, asset.assetType)}</span>
            <StatusPill tone={assetStatusTone(asset.status)}>{choiceLabel(ASSET_STATUS, asset.status)}</StatusPill>
          </div>
          {asset.serialNumber && <div className="mono help">{asset.serialNumber}</div>}
          <div className="field">
            <label htmlFor={`cond-${asset.id}`}>Condition When Given</label>
            <input
              id={`cond-${asset.id}`}
              type="text"
              placeholder="e.g. Good, minor scratch on lid"
              value={conditions[asset.id] ?? ''}
              onChange={(e) => setConditions((prev) => ({ ...prev, [asset.id]: e.target.value }))}
            />
          </div>
          <button className="btn btn-secondary-light" onClick={() => void confirm(asset.id)} disabled={busyId === asset.id}>
            {busyId === asset.id ? 'Confirming…' : 'Confirm receipt'}
          </button>
        </div>
      ))}
    </div>
  )
}

export function OfferFormBody({ subjectId, onDone }: { subjectId: string; onDone: () => void }) {
  const [offer, setOffer] = useState<OfferRow | null | undefined>(undefined)
  const [startDate, setStartDate] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    void offerFor(subjectId).then((o) => setOffer(o ?? null))
  }, [subjectId])

  if (offer === undefined) return <p className="help">Loading your offer…</p>
  if (offer === null) return <p className="help">No open offer was found for this link.</p>
  if (offer.status !== 1 && offer.status !== 2) {
    return (
      <p className="help" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        This offer has already been responded to —{' '}
        <StatusPill tone={offerStatusTone(offer.status)}>{choiceLabel(OFFER_STATUS, offer.status)}</StatusPill>
      </p>
    )
  }

  async function respond(accepted: boolean) {
    if (!offer) return
    setPending(true)
    await submitOfferResponse(offer.id, { accepted, startDate: accepted ? startDate : undefined })
    setPending(false)
    onDone()
  }

  return (
    <div className="form-grid">
      <div className="record-row" style={{ display: 'flex', gap: 24 }}>
        <div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            ₹{offer.offeredAmount.toLocaleString('en-IN')}
          </div>
          <div className="help">offered amount</div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            {offer.offerExpiry}
          </div>
          <div className="help">expires</div>
        </div>
      </div>
      <div className="field">
        <label htmlFor="startDate">Start Date</label>
        <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <p className="help">Only needed if you're accepting.</p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => void respond(true)} disabled={pending || !startDate}>
          Accept offer
        </button>
        <button className="btn btn-secondary-light" style={{ flex: 1 }} onClick={() => void respond(false)} disabled={pending}>
          Decline
        </button>
      </div>
    </div>
  )
}
