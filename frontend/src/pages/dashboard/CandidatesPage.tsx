import { useEffect, useState } from 'react'
import { CANDIDATE_STAGE } from '@shared/optionSets'
import { listAllCandidates, submitCandidateStage, type Candidate } from '../../lib/mockApi'
import { candidateStageTone } from '../../lib/statusTone'
import { PageHeader } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'

type Row = Candidate & { jobTitle: string }

const TONE_VAR: Record<string, string> = { green: 'green', orange: 'orange', danger: 'danger' }

export default function CandidatesPage() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    void listAllCandidates().then(setRows)
  }, [])

  async function changeStage(id: string, stage: number) {
    setBusyId(id)
    await submitCandidateStage(id, stage)
    const fresh = await listAllCandidates()
    setRows(fresh)
    setBusyId(null)
  }

  const columns: Column<Row>[] = [
    { key: 'name', label: 'Candidate', render: (r) => r.fullName },
    { key: 'role', label: 'Role', render: (r) => r.jobTitle },
    { key: 'email', label: 'Email', render: (r) => r.email },
    { key: 'phone', label: 'Phone', render: (r) => r.phone },
    {
      key: 'stage',
      label: 'Stage',
      render: (r) => {
        const tone = TONE_VAR[candidateStageTone(r.candidateStage)]
        return (
          <select
            className="stage-select"
            style={{ background: `var(--${tone}-bg)`, color: `var(--${tone}-fg)` }}
            value={r.candidateStage}
            disabled={busyId === r.id}
            onChange={(e) => void changeStage(r.id, Number(e.target.value))}
          >
            {CANDIDATE_STAGE.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader title="Candidates" subtitle="briqbi_applications — everyone who has applied, from any source." />
      <DataTable columns={columns} rows={rows} emptyText="No candidates yet." />
    </>
  )
}
