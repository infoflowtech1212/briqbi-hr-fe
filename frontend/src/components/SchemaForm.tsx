import { Fragment, useState, type ReactNode } from 'react'
import type { FieldDef } from '@shared/forms'
import { Field, type FieldValue } from './Field'

export type FormValues = Record<string, FieldValue>

export function SchemaForm({
  fields,
  onSubmit,
  submitLabel,
  pending,
  before,
}: {
  fields: FieldDef[]
  onSubmit: (values: FormValues) => void | Promise<void>
  submitLabel: string
  pending: boolean
  before?: ReactNode
}) {
  const [values, setValues] = useState<FormValues>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleChange(name: string, value: FieldValue) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    for (const field of fields) {
      const v = values[field.name]
      const empty = field.type === 'checkbox' ? !v : v === undefined || v === ''
      if (field.required && empty) {
        next[field.name] = `${field.label} is required.`
        continue
      }
      if (!empty && field.validate && typeof v === 'string') {
        const message = field.validate(v)
        if (message) next[field.name] = message
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  let lastSection: string | undefined
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault()
        if (!validate()) return
        void onSubmit(values)
      }}
    >
      {before}
      {fields.map((field) => {
        const showHeader = field.section && field.section !== lastSection
        lastSection = field.section
        return (
          <Fragment key={field.name}>
            {showHeader && <p className="section-header">{field.section}</p>}
            <Field
              def={field}
              value={values[field.name]}
              onChange={(v) => handleChange(field.name, v)}
              error={errors[field.name]}
            />
          </Fragment>
        )
      })}
      <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
        {pending ? 'Submitting…' : submitLabel}
      </button>
    </form>
  )
}
