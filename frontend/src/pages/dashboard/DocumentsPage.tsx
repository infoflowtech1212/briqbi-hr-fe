import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { choiceLabel, DOC_STATUS, DOC_TYPE, DOC_TYPES_BY_PERSON_TYPE } from '@shared/optionSets'
import {
  createDocument,
  deleteDocument,
  documentFileUrl,
  fetchDocuments,
  fetchTeamMembers,
  updateDocument,
  uploadDocumentFile,
  type DocumentRecord,
  type TeamMember,
} from '../../lib/api'
import { docStatusTone } from '../../lib/statusTone'
import { PageHeader, StatusPill } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'
import { FilterBar } from '../../components/FilterBar'
import { Pagination } from '../../components/Pagination'
import { usePagination } from '../../lib/usePagination'
import { Modal } from '../../components/Modal'
import { CloseIcon } from '../../components/icons'

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentRecord[] | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [viewing, setViewing] = useState<DocumentRecord | null>(null)
  const [editing, setEditing] = useState<DocumentRecord | null>(null)
  const [deleting, setDeleting] = useState<DocumentRecord | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  function reload() {
    Promise.all([fetchDocuments(), fetchTeamMembers()])
      .then(([d, m]) => {
        setDocs(d)
        setMembers(m)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load documents'))
  }

  useEffect(reload, [])

  const filtered = (docs ?? []).filter((r) => {
    if (search && !(r.memberName ?? '').toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== '' && r.documentType !== Number(typeFilter)) return false
    if (statusFilter !== '' && r.status !== Number(statusFilter)) return false
    return true
  })
  const { pageRows, page, setPage, totalPages } = usePagination(filtered, 10)

  const columns: Column<DocumentRecord>[] = [
    { key: 'member', label: 'Person', render: (r) => r.memberName ?? 'Unknown' },
    { key: 'type', label: 'Document Type', render: (r) => choiceLabel(DOC_TYPE, r.documentType) },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusPill tone={docStatusTone(r.status)}>{choiceLabel(DOC_STATUS, r.status)}</StatusPill>,
    },
    { key: 'neededBy', label: 'Needed By', render: (r) => (r.neededBy ? new Date(r.neededBy).toLocaleDateString() : '—') },
    { key: 'collected', label: 'Collected', render: (r) => (r.collectedDate ? new Date(r.collectedDate).toLocaleDateString() : '—') },
    { key: 'verified', label: 'Verified', render: (r) => (r.verified ? 'Yes' : 'No') },
    {
      key: 'file',
      label: 'File',
      render: (r) =>
        r.fileName ? (
          <a href={documentFileUrl(r.id)} target="_blank" rel="noopener noreferrer">
            {r.fileName}
          </a>
        ) : (
          '—'
        ),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary-light btn-sm" onClick={() => setViewing(r)}>
            View
          </button>
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
        title="Documents"
        subtitle="briqbi_documents — created at Missing up front, so nothing has to be noticed."
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)} disabled={members.length === 0}>
            Add Document
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
                label: 'Document Type',
                value: typeFilter,
                onChange: setTypeFilter,
                options: DOC_TYPE.map((c) => ({ value: String(c.value), label: c.label })),
              },
              {
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: DOC_STATUS.map((c) => ({ value: String(c.value), label: c.label })),
              },
            ]}
          />
          <DataTable columns={columns} rows={docs === null ? null : pageRows} emptyText="No documents match." />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {showAdd && (
        <AddDocumentModal
          members={members}
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false)
            reload()
          }}
        />
      )}

      {viewing && <DocumentDetailModal doc={viewing} onClose={() => setViewing(null)} />}

      {editing && (
        <EditDocumentModal
          doc={editing}
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
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete this document?</h2>
          <p className="help" style={{ marginBottom: 20 }}>
            This removes the document record permanently. This can't be undone.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary-light" style={{ flex: 1 }} onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, background: 'var(--danger-fg)' }}
              onClick={() => {
                void deleteDocument(deleting.id).then(() => {
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

function DocumentDetailModal({ doc, onClose }: { doc: DocumentRecord; onClose: () => void }) {
  const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString() : '—')

  return (
    <Modal onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon style={{ width: 16, height: 16 }} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{doc.memberName ?? 'Unknown'}</h2>
        <StatusPill tone={docStatusTone(doc.status)}>{choiceLabel(DOC_STATUS, doc.status)}</StatusPill>
      </div>
      <p className="help" style={{ marginBottom: 20 }}>{choiceLabel(DOC_TYPE, doc.documentType)}</p>

      <div className="stat-row" style={{ marginBottom: 24 }}>
        <div className="stat">
          <div className="num" style={{ fontSize: 16 }}>{fmt(doc.neededBy)}</div>
          <div className="cap">Needed By</div>
        </div>
        <div className="stat">
          <div className="num" style={{ fontSize: 16 }}>{fmt(doc.collectedDate)}</div>
          <div className="cap">Collected</div>
        </div>
        <div className="stat">
          <div className="num" style={{ fontSize: 16 }}>{fmt(doc.expiryDate)}</div>
          <div className="cap">Expires</div>
        </div>
      </div>

      <p className="subhead">Signature</p>
      <p style={{ marginBottom: 20 }}>
        Sent {fmt(doc.sentForSignature)} · Signed {fmt(doc.signedDate)}
        {doc.signatureMethod ? ` · via ${doc.signatureMethod}` : ''}
      </p>

      <p className="subhead">Verified</p>
      <p style={{ marginBottom: 20 }}>{doc.verified ? 'Yes' : 'No'}</p>

      <p className="subhead">File</p>
      <p style={{ marginBottom: 4 }}>
        {doc.fileName ? (
          <a href={documentFileUrl(doc.id)} target="_blank" rel="noopener noreferrer">
            {doc.fileName}
          </a>
        ) : (
          'Not attached'
        )}
      </p>
      {doc.fileUploadedAt && <p className="help">Uploaded {fmt(doc.fileUploadedAt)}</p>}
    </Modal>
  )
}

function AddDocumentModal({
  members,
  onClose,
  onCreated,
}: {
  members: TeamMember[]
  onClose: () => void
  onCreated: () => void
}) {
  const [teamMemberId, setTeamMemberId] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [neededBy, setNeededBy] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedMember = members.find((m) => m.id === teamMemberId)
  const applicableTypes = selectedMember
    ? DOC_TYPE.filter((c) => DOC_TYPES_BY_PERSON_TYPE[selectedMember.personType]?.includes(c.value))
    : DOC_TYPE

  function handlePersonChange(id: string) {
    setTeamMemberId(id)
    setDocumentType('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!teamMemberId || documentType === '') {
      setError('Person and document type are required.')
      return
    }
    setPending(true)
    try {
      await createDocument({
        teamMemberId,
        documentType: Number(documentType),
        neededBy: neededBy || undefined,
      })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add document.')
      setPending(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon style={{ width: 16, height: 16 }} />
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Add Document</h2>
      <form className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
        <div className="field">
          <label htmlFor="teamMemberId">Person</label>
          <select id="teamMemberId" value={teamMemberId} onChange={(e) => handlePersonChange(e.target.value)}>
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
          <label htmlFor="documentType">Document Type</label>
          <select
            id="documentType"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            disabled={!selectedMember}
          >
            <option value="" disabled>
              {selectedMember ? 'Choose one' : 'Choose a person first'}
            </option>
            {applicableTypes.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {selectedMember && <p className="help">Only document types required for this person's engagement type are shown.</p>}
        </div>
        <div className="field">
          <label htmlFor="neededBy">Needed By</label>
          <input id="neededBy" type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} />
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
          {pending ? 'Adding…' : 'Add Document'}
        </button>
      </form>
    </Modal>
  )
}

function EditDocumentModal({
  doc,
  onClose,
  onSaved,
}: {
  doc: DocumentRecord
  onClose: () => void
  onSaved: () => void
}) {
  const [status, setStatus] = useState(String(doc.status))
  const [collectedDate, setCollectedDate] = useState(doc.collectedDate ? doc.collectedDate.slice(0, 10) : '')
  const [expiryDate, setExpiryDate] = useState(doc.expiryDate ? doc.expiryDate.slice(0, 10) : '')
  const [sentForSignature, setSentForSignature] = useState(doc.sentForSignature ? doc.sentForSignature.slice(0, 10) : '')
  const [signatureMethod, setSignatureMethod] = useState(doc.signatureMethod ?? '')
  const [signedDate, setSignedDate] = useState(doc.signedDate ? doc.signedDate.slice(0, 10) : '')
  const [verified, setVerified] = useState(doc.verified)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState(doc.fileName)
  const [fileError, setFileError] = useState<string | null>(null)

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError(null)
    setUploading(true)
    try {
      await uploadDocumentFile(doc.id, file)
      setFileName(file.name)
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Failed to upload file.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await updateDocument(doc.id, {
        status: Number(status),
        collectedDate: collectedDate || undefined,
        expiryDate: expiryDate || undefined,
        sentForSignature: sentForSignature || undefined,
        signatureMethod: signatureMethod || undefined,
        signedDate: signedDate || undefined,
        verified,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document.')
      setPending(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon style={{ width: 16, height: 16 }} />
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{doc.memberName ?? 'Document'}</h2>
      <p className="help" style={{ marginBottom: 20 }}>{choiceLabel(DOC_TYPE, doc.documentType)}</p>
      <form className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {DOC_STATUS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="collectedDate">Collected Date</label>
          <input id="collectedDate" type="date" value={collectedDate} onChange={(e) => setCollectedDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="expiryDate">Expires</label>
          <input id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="sentForSignature">Sent for Signature</label>
          <input id="sentForSignature" type="date" value={sentForSignature} onChange={(e) => setSentForSignature(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="file">File</label>
          {fileName && (
            <p className="help">
              Current:{' '}
              <a href={documentFileUrl(doc.id)} target="_blank" rel="noopener noreferrer">
                {fileName}
              </a>
            </p>
          )}
          <input id="file" type="file" onChange={(e) => void handleFileChange(e)} disabled={uploading} />
          {uploading && <p className="help">Uploading…</p>}
          {fileError && <p className="error">{fileError}</p>}
        </div>
        <div className="field">
          <label htmlFor="signatureMethod">Signature Method</label>
          <input
            id="signatureMethod"
            type="text"
            placeholder="e.g. DocuSign, or Typed name"
            value={signatureMethod}
            onChange={(e) => setSignatureMethod(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="signedDate">Signed Date</label>
          <input id="signedDate" type="date" value={signedDate} onChange={(e) => setSignedDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="verified">
            <input
              id="verified"
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Verified
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </Modal>
  )
}
