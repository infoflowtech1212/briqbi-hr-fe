import { useEffect, useState } from 'react'
import { choiceLabel, OFFER_STATUS } from '@shared/optionSets'
import { listAllOffers, type OfferRow } from '../../lib/mockApi'
import { offerStatusTone } from '../../lib/statusTone'
import { PageHeader, StatusPill } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'

type Row = OfferRow & { candidateName: string }

const columns: Column<Row>[] = [
  { key: 'candidate', label: 'Candidate', render: (r) => r.candidateName },
  { key: 'amount', label: 'Amount', render: (r) => <span className="mono">₹{r.offeredAmount.toLocaleString('en-IN')}</span> },
  { key: 'expiry', label: 'Expires', render: (r) => r.offerExpiry },
  { key: 'start', label: 'Start Date', render: (r) => r.startDate ?? '—' },
  {
    key: 'status',
    label: 'Status',
    render: (r) => <StatusPill tone={offerStatusTone(r.status)}>{choiceLabel(OFFER_STATUS, r.status)}</StatusPill>,
  },
]

export default function OffersPage() {
  const [rows, setRows] = useState<Row[] | null>(null)

  useEffect(() => {
    void listAllOffers().then(setRows)
  }, [])

  return (
    <>
      <PageHeader title="Offers" subtitle="briqbi_offers — amount, expiry, and the candidate's answer." />
      <DataTable columns={columns} rows={rows} emptyText="No offers yet." />
    </>
  )
}
