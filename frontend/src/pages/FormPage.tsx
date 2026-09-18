import { useEffect, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { FORMS, FORM_FIELDS, type FormKey } from '@shared/forms'
import { fetchTeamMembers, updateTeamMember, verifyLinkToken, type TeamMember, type VerifiedLink } from '../lib/api'
import {
  submitConsent,
  submitExit,
  submitInterviewFeedback,
  submitPolicyAck,
  submitReference,
} from '../lib/mockApi'
import { TopBar, SiteFooter } from '../components/Chrome'
import { Badge, StageTracker } from '../components/ui'
import { SchemaForm, type FormValues } from '../components/SchemaForm'
import { AssetFormBody, DocumentsFormBody, OfferFormBody } from '../forms/RecordForms'
import { ClockIcon, FolderIcon, ShieldCheckIcon, BriefcaseIcon, BoxIcon, AlertIcon, CheckIcon } from '../components/icons'

const ACCENT_ICON: Record<string, typeof ClockIcon> = {
  blue: ClockIcon,
  green: ShieldCheckIcon,
  purple: BriefcaseIcon,
  orange: BoxIcon,
  teal: FolderIcon,
}

export default function FormPage() {
  const { token } = useParams()
  const [verified, setVerified] = useState<VerifiedLink | null>(null)
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null)

  useEffect(() => {
    void verifyLinkToken(token ?? '').then(setVerified)
  }, [token])

  const okPayload = verified?.ok ? verified.payload : null
  const meta = okPayload ? FORMS[okPayload.formKey as FormKey] : null

  useEffect(() => {
    if (okPayload && meta?.subjectKind === 'teamMember') {
      void fetchTeamMembers().then((members) => setTeamMember(members.find((m) => m.id === okPayload.subjectId) ?? null))
    }
  }, [okPayload, meta])

  if (!verified) {
    return (
      <Shell tag="forms">
        <p className="help">Checking link…</p>
      </Shell>
    )
  }

  if (!verified.ok || !okPayload || !meta) {
    const reason = verified.ok ? undefined : verified.reason
    const message =
      reason === 'expired'
        ? 'This link has expired. Ask HR to send you a new one.'
        : 'This link is invalid — it may have been copied incorrectly.'
    return (
      <Shell tag="forms">
        <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', maxWidth: 480 }}>
          <Badge accent="orange">
            <AlertIcon />
          </Badge>
          <div>
            <h1 style={{ fontSize: 20, marginBottom: 6 }}>Link not valid</h1>
            <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>{message}</p>
          </div>
        </div>
      </Shell>
    )
  }

  const { formKey, subjectId, subjectLabel } = okPayload
  const Icon = ACCENT_ICON[meta.accent] ?? ClockIcon
  const recordLine = teamMember ? `${teamMember.memberId} · ${subjectLabel}` : subjectLabel

  async function handleGenericSubmit(values: FormValues) {
    setPending(true)
    switch (formKey as FormKey) {
      case 'joiner':
        await updateTeamMember(subjectId, {
          personalEmail: String(values.personalEmail ?? ''),
          phone: String(values.phone ?? ''),
          emergencyContact: String(values.emergencyContact ?? ''),
          pan: String(values.pan ?? ''),
          bankAccountRef: String(values.bankAccountRef ?? ''),
        })
        break
      case 'consent':
        await submitConsent(subjectId, {
          consentReceived: Boolean(values.consentReceived),
          notes: values.notes ? String(values.notes) : undefined,
        })
        break
      case 'policy':
        await submitPolicyAck(subjectId)
        break
      case 'interview':
        await submitInterviewFeedback(subjectId, {
          round: String(values.round ?? ''),
          strengths: values.strengths ? String(values.strengths) : undefined,
          concerns: values.concerns ? String(values.concerns) : undefined,
          recommendation: Number(values.recommendation ?? 2),
        })
        break
      case 'reference':
        await submitReference(subjectId, {
          referenceNotes: String(values.referenceNotes ?? ''),
          wouldRehire: values.wouldRehire === undefined ? undefined : Number(values.wouldRehire),
        })
        break
      case 'exit':
        await submitExit(subjectId, {
          exitReason: String(values.exitReason ?? ''),
          lastWorkingDay: String(values.lastWorkingDay ?? ''),
        })
        break
      default:
        break
    }
    setPending(false)
    setDone(true)
  }

  return (
    <Shell tag="forms">
      <div className="form-shell">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 6 }}>
            <Badge accent={meta.accent}>
              <Icon />
            </Badge>
            <div style={{ flex: 1 }}>
              <div className="record-line mono">{recordLine}</div>
              <h1 className="form-title">{meta.title}</h1>
            </div>
          </div>
          <p className="form-meta">
            {meta.who} · writes to {meta.writesTo}
          </p>
          <p className="form-description">{meta.description}</p>

          {formKey === 'joiner' && teamMember && (
            <div style={{ marginBottom: 24 }}>
              <StageTracker currentStage={teamMember.onboardingStage} />
            </div>
          )}

          {done ? (
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <Badge accent="blue">
                <CheckIcon />
              </Badge>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Recorded.</div>
                <p className="help" style={{ marginTop: 4 }}>
                  Thanks — you can close this tab.
                </p>
              </div>
            </div>
          ) : formKey === 'documents' ? (
            <DocumentsFormBody subjectId={subjectId} onDone={() => setDone(true)} />
          ) : formKey === 'asset' ? (
            <AssetFormBody subjectId={subjectId} onDone={() => setDone(true)} />
          ) : formKey === 'offer' ? (
            <OfferFormBody subjectId={subjectId} onDone={() => setDone(true)} />
          ) : (
            <SchemaForm
              fields={FORM_FIELDS[formKey as FormKey] ?? []}
              onSubmit={handleGenericSubmit}
              submitLabel={meta.submitLabel}
              pending={pending}
            />
          )}
        </div>
      </div>
    </Shell>
  )
}

function Shell({ tag, children }: { tag: string; children: ReactNode }) {
  return (
    <>
      <TopBar tag={tag} />
      <main className="page-body">
        <div className="wrap">{children}</div>
      </main>
      <SiteFooter />
    </>
  )
}
