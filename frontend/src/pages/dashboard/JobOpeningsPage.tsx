import { useEffect, useState } from 'react'
import { fetchJobOpenings, type JobOpening } from '../../lib/api'
import { PageHeader, StatusPill } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'
import { FilterBar } from '../../components/FilterBar'
import { Pagination } from '../../components/Pagination'
import { usePagination } from '../../lib/usePagination'
import { Modal } from '../../components/Modal'
import { CloseIcon } from '../../components/icons'

export default function JobOpeningsPage() {
  const [rows, setRows] = useState<JobOpening[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<JobOpening | null>(null)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchJobOpenings()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load job openings'))
  }, [])

  const departments = [...new Set((rows ?? []).map((r) => r.department))].sort()
  const filtered = (rows ?? []).filter((r) => {
    if (search && !r.role.toLowerCase().includes(search.toLowerCase())) return false
    if (deptFilter !== '' && r.department !== deptFilter) return false
    if (statusFilter !== '' && String(r.isActive) !== statusFilter) return false
    return true
  })
  const { pageRows, page, setPage, totalPages } = usePagination(filtered, 10)

  const columns: Column<JobOpening>[] = [
    { key: 'role', label: 'Role', render: (r) => r.role },
    { key: 'dept', label: 'Department', render: (r) => r.department },
    { key: 'location', label: 'Location', render: (r) => r.location },
    { key: 'type', label: 'Type', render: (r) => r.employmentType },
    { key: 'experience', label: 'Experience', render: (r) => `${r.experienceRequired}+ yrs` },
    { key: 'skills', label: 'Skills', render: (r) => r.skills.join(', ') },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusPill tone={r.isActive ? 'green' : 'neutral'}>{r.isActive ? 'Active' : 'Inactive'}</StatusPill>,
    },
    {
      key: 'view',
      label: '',
      render: (r) => (
        <button className="btn btn-secondary-light btn-sm" onClick={() => setSelected(r)}>
          View
        </button>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Job Openings" subtitle="Synced from the live careers API — every role currently posted." />
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by role…"
            filters={[
              {
                label: 'Department',
                value: deptFilter,
                onChange: setDeptFilter,
                options: departments.map((d) => ({ value: d, label: d })),
              },
              {
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' },
                ],
              },
            ]}
          />
          <DataTable columns={columns} rows={rows === null ? null : pageRows} emptyText="No job openings match." />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close">
            <CloseIcon style={{ width: 16, height: 16 }} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>{selected.role}</h2>
            <StatusPill tone={selected.isActive ? 'green' : 'neutral'}>{selected.isActive ? 'Active' : 'Inactive'}</StatusPill>
          </div>
          <p className="help" style={{ marginBottom: 20 }}>
            {selected.companyName}
          </p>

          <div className="stat-row" style={{ marginBottom: 24 }}>
            <div className="stat">
              <div className="num" style={{ fontSize: 16 }}>
                {selected.department}
              </div>
              <div className="cap">Department</div>
            </div>
            <div className="stat">
              <div className="num" style={{ fontSize: 16 }}>
                {selected.location}
              </div>
              <div className="cap">Location</div>
            </div>
            <div className="stat">
              <div className="num" style={{ fontSize: 16 }}>
                {selected.employmentType}
              </div>
              <div className="cap">Type</div>
            </div>
          </div>

          <p className="subhead">Experience required</p>
          <p style={{ marginBottom: 20 }}>{selected.experienceRequired}+ years</p>

          <p className="subhead">Skills</p>
          <div className="tag-row" style={{ marginBottom: 20 }}>
            {selected.skills.map((s) => (
              <span className="tag" key={s}>
                {s}
              </span>
            ))}
          </div>

          <p className="subhead">Posted</p>
          <p style={{ marginBottom: 20 }}>{new Date(selected.postedAt).toLocaleDateString()}</p>

          <p className="subhead">Full description</p>
          <p className="modal-description">{selected.description}</p>
        </Modal>
      )}
    </>
  )
}
