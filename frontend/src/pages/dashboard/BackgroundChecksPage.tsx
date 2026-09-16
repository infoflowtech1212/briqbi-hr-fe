import { useEffect, useState } from 'react'
import { CHECK_STATUS, choiceLabel } from '@shared/optionSets'
import { listAllBackgroundChecks, type BackgroundCheck } from '../../lib/mockApi'
import { checkStatusTone } from '../../lib/statusTone'
import { PageHeader, StatusPill } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'

type Row = BackgroundCheck & { memberName: string }

const columns: Column<Row>[] = [
  { key: 'member', label: 'Person', render: (r) => r.memberName },
  {
    key: 'status',
    label: 'Status',
    render: (r) => <StatusPill tone={checkStatusTone(r.status)}>{choiceLabel(CHECK_STATUS, r.status)}</StatusPill>,
  },
  { key: 'consent', label: 'Consent Signed', render: (r) => (r.consentReceived ? 'Yes' : 'No') },
  { key: 'consentDate', label: 'Consent Date', render: (r) => r.consentDate ?? '—' },
  { key: 'notes', label: 'Notes', render: (r) => (r.notes ? r.notes.split('\n')[0] : '—') },
]

export default function BackgroundChecksPage() {
  const [rows, setRows] = useState<Row[] | null>(null)

  useEffect(() => {
    void listAllBackgroundChecks().then(setRows)
  }, [])

  return (
    <>
      <PageHeader title="Background Checks" subtitle="briqbi_backgroundchecks — consent, provider, and outcome per person." />
      <DataTable columns={columns} rows={rows} emptyText="No background checks yet." />
    </>
  )
}
