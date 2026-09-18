import { useEffect, useState, type FormEvent } from 'react'
import { ASSET_STATUS, ASSET_TYPE, choiceLabel } from '@shared/optionSets'
import {
  createAsset,
  deleteAsset,
  fetchAssets,
  fetchTeamMembers,
  updateAsset,
  type Asset,
  type TeamMember,
} from '../../lib/api'
import { assetStatusTone } from '../../lib/statusTone'
import { PageHeader, StatusPill } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'
import { FilterBar } from '../../components/FilterBar'
import { Pagination } from '../../components/Pagination'
import { usePagination } from '../../lib/usePagination'
import { Modal } from '../../components/Modal'
import { CloseIcon } from '../../components/icons'

type Row = Asset & { memberName: string }

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[] | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)
  const [deleting, setDeleting] = useState<Asset | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  function reload() {
    Promise.all([fetchAssets(), fetchTeamMembers()])
      .then(([a, m]) => {
        setAssets(a)
        setMembers(m)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load assets'))
  }

  useEffect(reload, [])

  function memberName(id: string): string {
    return members.find((m) => m.id === id)?.fullName ?? 'Unknown'
  }

  const rows: Row[] | null = assets && assets.map((a) => ({ ...a, memberName: memberName(a.teamMemberId) }))

  const filtered = (rows ?? []).filter((r) => {
    if (search && !r.memberName.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== '' && r.assetType !== Number(typeFilter)) return false
    if (statusFilter !== '' && r.status !== Number(statusFilter)) return false
    return true
  })
  const { pageRows, page, setPage, totalPages } = usePagination(filtered, 10)

  const columns: Column<Row>[] = [
    { key: 'member', label: 'Who Has It', render: (r) => r.memberName },
    { key: 'type', label: 'Item', render: (r) => choiceLabel(ASSET_TYPE, r.assetType) },
    { key: 'serial', label: 'Serial Number', render: (r) => <span className="mono">{r.serialNumber ?? '—'}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusPill tone={assetStatusTone(r.status)}>{choiceLabel(ASSET_STATUS, r.status)}</StatusPill>,
    },
    { key: 'condition', label: 'Condition When Given', render: (r) => r.conditionAtIssue ?? '—' },
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
        title="Assets"
        subtitle="briqbi_assets — kit issued, its condition, and whether it's come back."
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)} disabled={members.length === 0}>
            Add Asset
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
            searchPlaceholder="Search by holder…"
            filters={[
              {
                label: 'Item',
                value: typeFilter,
                onChange: setTypeFilter,
                options: ASSET_TYPE.map((c) => ({ value: String(c.value), label: c.label })),
              },
              {
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: ASSET_STATUS.map((c) => ({ value: String(c.value), label: c.label })),
              },
            ]}
          />
          <DataTable columns={columns} rows={rows === null ? null : pageRows} emptyText="No assets match." />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {showAdd && (
        <AssetFormModal
          members={members}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false)
            reload()
          }}
        />
      )}

      {editing && (
        <AssetFormModal
          asset={editing}
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
            Delete this {choiceLabel(ASSET_TYPE, deleting.assetType)}?
          </h2>
          <p className="help" style={{ marginBottom: 20 }}>
            This removes the asset record permanently. This can't be undone.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary-light" style={{ flex: 1 }} onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, background: 'var(--danger-fg)' }}
              onClick={() => {
                void deleteAsset(deleting.id).then(() => {
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

function AssetFormModal({
  asset,
  members,
  onClose,
  onSaved,
}: {
  asset?: Asset
  members: TeamMember[]
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = Boolean(asset)
  const [teamMemberId, setTeamMemberId] = useState(asset?.teamMemberId ?? '')
  const [assetType, setAssetType] = useState(asset ? String(asset.assetType) : '')
  const [status, setStatus] = useState(asset ? String(asset.status) : '0')
  const [serialNumber, setSerialNumber] = useState(asset?.serialNumber ?? '')
  const [conditionAtIssue, setConditionAtIssue] = useState(asset?.conditionAtIssue ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!teamMemberId || assetType === '') {
      setError('Team member and item are required.')
      return
    }
    setPending(true)
    try {
      if (isEdit && asset) {
        await updateAsset(asset.id, {
          teamMemberId,
          assetType: Number(assetType),
          status: Number(status),
          serialNumber: serialNumber || undefined,
          conditionAtIssue: conditionAtIssue || undefined,
        })
      } else {
        await createAsset({
          teamMemberId,
          assetType: Number(assetType),
          serialNumber: serialNumber || undefined,
          conditionAtIssue: conditionAtIssue || undefined,
        })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save asset.')
      setPending(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon style={{ width: 16, height: 16 }} />
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{isEdit ? 'Edit Asset' : 'Add Asset'}</h2>
      <form className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
        <div className="field">
          <label htmlFor="teamMemberId">Who Has It</label>
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
          <label htmlFor="assetType">Item</label>
          <select id="assetType" value={assetType} onChange={(e) => setAssetType(e.target.value)}>
            <option value="" disabled>
              Choose one
            </option>
            {ASSET_TYPE.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="serialNumber">Serial Number</label>
          <input id="serialNumber" type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="conditionAtIssue">Condition When Given</label>
          <input
            id="conditionAtIssue"
            type="text"
            value={conditionAtIssue}
            onChange={(e) => setConditionAtIssue(e.target.value)}
          />
        </div>
        {isEdit && (
          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {ASSET_STATUS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
          {pending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Asset'}
        </button>
      </form>
    </Modal>
  )
}
