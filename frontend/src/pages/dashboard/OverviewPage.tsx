import { useEffect, useState } from 'react'
import {
  listAllAssets,
  listAllBackgroundChecks,
  listAllDocuments,
  listAllJobOpenings,
  listCandidates,
  listTeamMembers,
} from '../../lib/mockApi'
import { fetchJoiningTasks } from '../../lib/api'
import { PageHeader, StatRow } from '../../components/ui'

interface Attention {
  label: string
  count: number
  hint: string
}

export default function OverviewPage() {
  const [core, setCore] = useState<{ members: number; openings: number; candidates: number } | null>(null)
  const [attention, setAttention] = useState<Attention[] | null>(null)

  useEffect(() => {
    void Promise.all([
      listTeamMembers(),
      listAllJobOpenings(),
      listCandidates(),
      listAllBackgroundChecks(),
      listAllDocuments(),
      fetchJoiningTasks(),
      listAllAssets(),
    ]).then(([members, openings, candidates, checks, docs, tasks, assets]) => {
      setCore({
        members: members.length,
        openings: openings.filter((o) => o.status === 0).length,
        candidates: candidates.length,
      })
      setAttention([
        {
          label: 'Needs attention',
          count: members.filter((m) => m.bgvOverdue).length + checks.filter((c) => c.status === 4).length,
          hint: 'people with an overdue background check',
        },
        {
          label: 'Needs chasing',
          count: docs.filter((d) => d.status === 2).length,
          hint: 'documents sent for signature, not yet back',
        },
        {
          label: 'Missing or unverified',
          count: docs.filter((d) => d.status === 0).length,
          hint: 'documents still at status Missing',
        },
        {
          label: 'Must-do items open',
          count: tasks.filter((t) => t.mustDo && t.status !== 2).length,
          hint: 'joining tasks flagged Must do, not yet Done',
        },
        {
          label: 'Not returned',
          count: assets.filter((a) => a.status === 2).length,
          hint: 'kit marked Due back',
        },
      ])
    })
  }, [])

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Briqbi HR — 10 Dataverse tables, 3 Power Automate flows, 10 external forms, one Azure Function in between."
      />

      <StatRow
        stats={[
          { num: core ? String(core.members) : '—', cap: 'team members' },
          { num: core ? String(core.openings) : '—', cap: 'open job openings' },
          { num: core ? String(core.candidates) : '—', cap: 'candidates in the pipeline' },
        ]}
      />

      <div style={{ height: 32 }} />
      <p className="subhead">Needs attention — the five saved views from the model-driven app</p>
      {attention === null ? (
        <p className="help">Loading…</p>
      ) : (
        <div className="card-grid">
          {attention.map((a) => (
            <div className="card" key={a.label}>
              <div style={{ fontSize: 30, fontWeight: 800, fontFamily: 'var(--font-display)' }} className="tabular">
                {a.count}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, marginTop: 6 }}>{a.label}</div>
              <p className="help" style={{ marginTop: 4 }}>
                {a.hint}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
