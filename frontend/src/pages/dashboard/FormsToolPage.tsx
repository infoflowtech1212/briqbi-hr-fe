import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FORMS, LINKED_FORM_KEYS, type FormKey } from '@shared/forms'
import { choiceLabel, MEMBER_STATUS, CANDIDATE_STAGE } from '@shared/optionSets'
import {
  listCandidates,
  listMintedLinks,
  listTeamMembers,
  mintLink,
  recordLink,
  type Candidate,
  type MintedLink,
  type TeamMember,
} from '../../lib/mockApi'
import { encodeToken } from '../../lib/linkToken'
import { PageHeader } from '../../components/ui'
import { CopyIcon, ArrowUpRightIcon } from '../../components/icons'

export default function FormsToolPage() {
  return (
    <>
      <PageHeader
        title="Mint a form link"
        subtitle="Pick the form, pick the person, copy the link. Default life is 14 days — the same link cannot reach anyone else's record."
      />
      <MintTool />
      <div style={{ height: 32 }} />
      <RecentLinks />
    </>
  )
}

function MintTool() {
  const [formKey, setFormKey] = useState<FormKey>('joiner')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [subjectId, setSubjectId] = useState('')
  const [expiryDays, setExpiryDays] = useState(14)
  const [generated, setGenerated] = useState<{ url: string; expiresAt: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    void listTeamMembers().then(setTeamMembers)
    void listCandidates().then(setCandidates)
  }, [])

  const meta = FORMS[formKey]
  const subjects: (TeamMember | Candidate)[] =
    meta.subjectKind === 'candidate'
      ? meta.eligibleCandidateStages
        ? candidates.filter((c) => meta.eligibleCandidateStages!.includes(c.candidateStage))
        : candidates
      : meta.eligibleMemberStatuses
        ? teamMembers.filter((m) => meta.eligibleMemberStatuses!.includes(m.memberStatus))
        : teamMembers
  const subjectLabel = (id: string) => {
    const s = subjects.find((x) => x.id === id)
    return s?.fullName ?? ''
  }
  const subjectStatus = (s: TeamMember | Candidate) =>
    meta.subjectKind === 'candidate'
      ? choiceLabel(CANDIDATE_STAGE, (s as Candidate).candidateStage)
      : choiceLabel(MEMBER_STATUS, (s as TeamMember).memberStatus)

  async function generate() {
    if (!subjectId) return
    const label = subjectLabel(subjectId)
    const link = await mintLink({ formKey, subjectId, subjectLabel: label, expiryDays })
    const token = encodeToken({
      formKey,
      subjectId,
      subjectLabel: label,
      exp: new Date(link.expiresAt).getTime(),
    })
    const full: MintedLink = { ...link, token }
    await recordLink(full)
    setGenerated({ url: `${window.location.origin}/f/${token}`, expiresAt: link.expiresAt })
    setCopied(false)
  }

  async function copy() {
    if (!generated) return
    try {
      await navigator.clipboard.writeText(generated.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard unavailable — the field below is still selectable manually
    }
  }

  return (
    <div className="card">
      <p className="subhead">Generate a link</p>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: 16 }}>
        <div className="field">
          <label htmlFor="formKey">Form</label>
          <select
            id="formKey"
            value={formKey}
            onChange={(e) => {
              setFormKey(e.target.value as FormKey)
              setSubjectId('')
              setGenerated(null)
            }}
          >
            {LINKED_FORM_KEYS.map((key) => (
              <option key={key} value={key}>
                {FORMS[key].title} — {FORMS[key].who}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="subject">{meta.subjectKind === 'candidate' ? 'Candidate' : 'Team member'}</label>
          <select id="subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={subjects.length === 0}>
            <option value="" disabled>
              {subjects.length === 0 ? 'No one at the right status' : 'Choose one'}
            </option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} — {subjectStatus(s)}
              </option>
            ))}
          </select>
          {subjects.length === 0 && (
            <p className="help">
              Nobody is currently at the status this form needs ({meta.who}). Nothing to mint a link for yet.
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="expiry">Link life (days)</label>
          <input
            id="expiry"
            type="number"
            min={1}
            max={60}
            value={expiryDays}
            onChange={(e) => setExpiryDays(Number(e.target.value) || 14)}
          />
        </div>
      </div>
      <div style={{ marginTop: 18 }}>
        <button className="btn btn-solid-dark" onClick={() => void generate()} disabled={!subjectId}>
          Generate link
        </button>
      </div>
      {generated && (
        <div style={{ marginTop: 18, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            readOnly
            value={generated.url}
            className="mono"
            style={{ flex: 1, fontSize: 12.5, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--paper-border)' }}
          />
          <button className="btn btn-secondary-light btn-sm" onClick={() => void copy()}>
            <CopyIcon />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}

function RecentLinks() {
  const [links, setLinks] = useState<MintedLink[]>([])

  useEffect(() => {
    void listMintedLinks().then(setLinks)
  }, [])

  if (links.length === 0) return null

  return (
    <div>
      <p className="subhead">Recently minted</p>
      <div className="form-grid" style={{ gap: 10 }}>
        {links.map((l) => (
          <div
            key={l.token}
            className="card"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 12 }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                {FORMS[l.formKey as FormKey]?.title} · {l.subjectLabel}
              </div>
              <div className="help" style={{ marginTop: 2 }}>
                Expires {new Date(l.expiresAt).toLocaleDateString()}
              </div>
            </div>
            <Link className="btn btn-secondary-light btn-sm" to={`/f/${l.token}`} target="_blank" rel="noreferrer">
              Open
              <ArrowUpRightIcon />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
