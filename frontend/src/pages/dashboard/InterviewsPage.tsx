import { useEffect, useState } from 'react'
import { choiceLabel, RECOMMENDATION } from '@shared/optionSets'
import { listAllInterviews, type InterviewRow } from '../../lib/mockApi'
import { recommendationTone } from '../../lib/statusTone'
import { PageHeader, StatusPill } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'

type Row = InterviewRow & { candidateName: string }

const columns: Column<Row>[] = [
  { key: 'candidate', label: 'Candidate', render: (r) => r.candidateName },
  { key: 'round', label: 'Round', render: (r) => r.round ?? '—' },
  {
    key: 'verdict',
    label: 'Verdict',
    render: (r) =>
      r.recommendation === undefined ? (
        <StatusPill tone="neutral">Not yet given</StatusPill>
      ) : (
        <StatusPill tone={recommendationTone(r.recommendation)}>{choiceLabel(RECOMMENDATION, r.recommendation)}</StatusPill>
      ),
  },
  { key: 'strengths', label: 'What Was Good', render: (r) => r.strengths ?? '—' },
  { key: 'concerns', label: 'What Worried You', render: (r) => r.concerns ?? '—' },
]

export default function InterviewsPage() {
  const [rows, setRows] = useState<Row[] | null>(null)

  useEffect(() => {
    void listAllInterviews().then(setRows)
  }, [])

  return (
    <>
      <PageHeader title="Interviews" subtitle="briqbi_interviews — verdicts and written feedback per round." />
      <DataTable columns={columns} rows={rows} emptyText="No interviews yet." />
    </>
  )
}
