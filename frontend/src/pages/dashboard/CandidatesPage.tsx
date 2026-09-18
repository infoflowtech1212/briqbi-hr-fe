import { useEffect, useMemo, useState } from 'react'
import {
  APPLICATION_STATUSES,
  fetchCandidates,
  fetchResumeUrl,
  updateCandidateStatus,
  type ApplicationStatus,
  type Candidate,
} from '../../lib/api'
import { applicationStatusTone } from '../../lib/statusTone'
import { PageHeader } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'
import { FilterBar } from '../../components/FilterBar'
import { Pagination } from '../../components/Pagination'
import { usePagination } from '../../lib/usePagination'

const TONE_VAR: Record<string, string> = { green: 'green', orange: 'orange', danger: 'danger' }

export default function CandidatesPage() {
  const [rows, setRows] = useState<Candidate[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | ApplicationStatus>('')
  const [resumeError, setResumeError] = useState<string | null>(null)

  function reload() {
    fetchCandidates()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load candidates'))
  }

  useEffect(reload, [])

  async function changeStatus(id: string, status: ApplicationStatus) {
    setBusyId(id)
    try {
      await updateCandidateStatus(id, status)
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update candidate')
    }
    setBusyId(null)
  }

  async function openResume(candidate: Candidate) {
    setResumeError(null)
    try {
      const url = await fetchResumeUrl(candidate.id)
      window.open(url, '_blank', 'noopener')
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : 'Failed to open resume')
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (rows ?? []).filter((r) => {
      const matchesSearch = !q || r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      const matchesStatus = !statusFilter || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [rows, search, statusFilter])
  const { pageRows, page, setPage, totalPages } = usePagination(filtered, 10)

  const columns: Column<Candidate>[] = [
    {
      key: 'applicant',
      label: 'Applicant',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700 }}>{r.fullName}</div>
          <div className="help">{r.email}</div>
        </div>
      ),
    },
    { key: 'role', label: 'Applied For', render: (r) => r.jobTitle },
    { key: 'phone', label: 'Phone', render: (r) => r.phone },
    { key: 'experience', label: 'Experience', render: (r) => (r.experienceYears === undefined ? '—' : `${r.experienceYears} yrs`) },
    {
      key: 'status',
      label: 'Status',
      render: (r) => {
        const tone = TONE_VAR[applicationStatusTone(r.status)]
        return (
          <select
            className="stage-select"
            style={{ background: `var(--${tone}-bg)`, color: `var(--${tone}-fg)` }}
            value={r.status}
            disabled={busyId === r.id}
            onChange={(e) => void changeStatus(r.id, e.target.value as ApplicationStatus)}
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        )
      },
    },
    { key: 'appliedOn', label: 'Applied On', render: (r) => (r.appliedAt ? new Date(r.appliedAt).toLocaleDateString() : '—') },
    {
      key: 'resume',
      label: '',
      render: (r) =>
        r.resumeFileName ? (
          <button className="btn btn-secondary-light btn-sm" onClick={() => void openResume(r)}>
            Resume
          </button>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <>
      <PageHeader title="Candidates" subtitle="Everyone who has applied, synced from the live careers site." />
      {error && <p className="error">{error}</p>}
      {resumeError && <p className="error">{resumeError}</p>}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email…"
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: (v) => setStatusFilter(v as '' | ApplicationStatus),
            options: APPLICATION_STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
          },
        ]}
      />
      <DataTable columns={columns} rows={rows === null ? null : pageRows} emptyText="No candidates match." />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  )
}
