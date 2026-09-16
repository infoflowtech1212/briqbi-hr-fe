import { useEffect, useState } from 'react'
import { fetchJobOpenings, type JobOpening } from '../../lib/api'
import { PageHeader, StatusPill } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'
import { Modal } from '../../components/Modal'
import { CloseIcon } from '../../components/icons'

export default function JobOpeningsPage() {
  const [rows, setRows] = useState<JobOpening[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<JobOpening | null>(null)

  useEffect(() => {
    fetchJobOpenings()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load job openings'))
  }, [])

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
      {error ? <p className="error">{error}</p> : <DataTable columns={columns} rows={rows} emptyText="No job openings yet." />}

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
