import { useEffect, useState } from 'react'
import { choiceLabel, DOC_STATUS, DOC_TYPE } from '@shared/optionSets'
import { listAllDocuments, type DocumentRow } from '../../lib/mockApi'
import { docStatusTone } from '../../lib/statusTone'
import { PageHeader, StatusPill } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'

type Row = DocumentRow & { memberName: string }

const columns: Column<Row>[] = [
  { key: 'member', label: 'Person', render: (r) => r.memberName },
  { key: 'type', label: 'Document Type', render: (r) => choiceLabel(DOC_TYPE, r.documentType) },
  {
    key: 'status',
    label: 'Status',
    render: (r) => <StatusPill tone={docStatusTone(r.status)}>{choiceLabel(DOC_STATUS, r.status)}</StatusPill>,
  },
  { key: 'neededBy', label: 'Needed By', render: (r) => r.neededBy ?? '—' },
  { key: 'collected', label: 'Collected', render: (r) => r.collectedDate ?? '—' },
]

export default function DocumentsPage() {
  const [rows, setRows] = useState<Row[] | null>(null)

  useEffect(() => {
    void listAllDocuments().then(setRows)
  }, [])

  return (
    <>
      <PageHeader
        title="Documents"
        subtitle="briqbi_documents — created at Missing up front, so nothing has to be noticed."
      />
      <DataTable columns={columns} rows={rows} emptyText="No documents yet." />
    </>
  )
}
