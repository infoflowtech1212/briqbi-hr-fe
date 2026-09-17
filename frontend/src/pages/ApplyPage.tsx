import { useEffect, useState, type FormEvent } from 'react'
import { FORM_FIELDS } from '@shared/forms'
import { createCandidate, fetchJobOpenings, type JobOpening } from '../lib/api'
import { TopBar, SiteFooter } from '../components/Chrome'
import { Field, type FieldValue } from '../components/Field'
import { Badge } from '../components/ui'
import { CheckIcon } from '../components/icons'

const fields = FORM_FIELDS.apply ?? []

export default function ApplyPage() {
  const [openings, setOpenings] = useState<JobOpening[] | null>(null)
  const [jobOpeningId, setJobOpeningId] = useState('')
  const [values, setValues] = useState<Record<string, FieldValue>>({})
  const [cvName, setCvName] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchJobOpenings(true).then(setOpenings)
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!jobOpeningId) {
      setError('Choose the role you are applying for.')
      return
    }
    if (!values.fullName || !values.email || !values.phone) {
      setError('Name, email and phone are required.')
      return
    }
    setPending(true)
    try {
      await createCandidate({
        fullName: String(values.fullName),
        email: String(values.email),
        phone: String(values.phone),
        jobOpeningId,
        linkedinUrl: values.linkedinUrl ? String(values.linkedinUrl) : undefined,
        experienceYears: values.experienceYears === undefined ? undefined : Number(values.experienceYears),
        resumeFileName: cvName ?? undefined,
      })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application.')
    }
    setPending(false)
  }

  return (
    <>
      <TopBar tag="careers" />
      <section className="hero">
        <div className="wrap">
          <span className="eyebrow on-dark">CAREERS AT BRIQBI</span>
          <h1>
            Apply to join <span className="accent">us.</span>
          </h1>
          <p className="lede">No account required to apply. Fill in what you can — a CV and a way to reach you is the minimum.</p>
        </div>
      </section>

      <main className="page-body">
        <div className="wrap" style={{ maxWidth: 560 }}>
          {done ? (
            <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <Badge accent="purple">
                <CheckIcon />
              </Badge>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Application received.</div>
                <p style={{ color: 'var(--ink-muted)', fontSize: 13.5, marginTop: 4 }}>
                  We'll be in touch by email if there's a fit. Thanks for applying.
                </p>
              </div>
            </div>
          ) : (
            <form className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
              <div className="field">
                <label htmlFor="jobOpening">Role</label>
                <select id="jobOpening" value={jobOpeningId} onChange={(e) => setJobOpeningId(e.target.value)}>
                  <option value="" disabled>
                    {openings ? 'Choose a role' : 'Loading open roles…'}
                  </option>
                  {openings?.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.role} · {o.department}
                    </option>
                  ))}
                </select>
              </div>

              {fields.map((field) => (
                <Field
                  key={field.name}
                  def={field}
                  value={values[field.name]}
                  onChange={(v) => setValues((prev) => ({ ...prev, [field.name]: v }))}
                />
              ))}

              <div className="field">
                <label htmlFor="cv">CV</label>
                <input
                  id="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvName(e.target.files?.[0]?.name ?? null)}
                />
                <p className="help">{cvName ?? 'PDF or Word, up to 10MB'}</p>
              </div>

              {error && <p className="error">{error}</p>}

              <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
                {pending ? 'Sending…' : 'Submit application'}
              </button>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
