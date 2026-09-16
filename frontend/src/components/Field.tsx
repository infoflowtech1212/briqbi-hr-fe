import type { FieldDef } from '@shared/forms'

export type FieldValue = string | number | boolean | undefined

export function Field({
  def,
  value,
  onChange,
  error,
}: {
  def: FieldDef
  value: FieldValue
  onChange: (value: FieldValue) => void
  error?: string
}) {
  if (def.type === 'checkbox') {
    return (
      <div className="field">
        <div className="field-checkbox">
          <input
            id={def.name}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <label htmlFor={def.name}>{def.label}</label>
        </div>
        {def.help && <p className="help">{def.help}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    )
  }

  if (def.type === 'select') {
    return (
      <div className="field">
        <label htmlFor={def.name}>{def.label}</label>
        <select
          id={def.name}
          value={value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        >
          <option value="" disabled>
            Choose one
          </option>
          {def.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {def.help && <p className="help">{def.help}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    )
  }

  if (def.type === 'textarea') {
    return (
      <div className="field">
        <label htmlFor={def.name}>{def.label}</label>
        <textarea
          id={def.name}
          value={typeof value === 'string' ? value : ''}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {def.help && <p className="help">{def.help}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    )
  }

  if (def.type === 'currency') {
    return (
      <div className="field">
        <label htmlFor={def.name}>{def.label}</label>
        <div className="currency-input">
          <input
            id={def.name}
            type="number"
            min={0}
            value={value === undefined ? '' : String(value)}
            placeholder={def.placeholder}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          />
        </div>
        {def.help && <p className="help">{def.help}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    )
  }

  const inputType = def.type === 'number' ? 'number' : def.type
  return (
    <div className="field">
      <label htmlFor={def.name}>{def.label}</label>
      <input
        id={def.name}
        type={inputType}
        value={value === undefined ? '' : String(value)}
        placeholder={def.placeholder}
        onChange={(e) => onChange(def.type === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value)}
      />
      {def.help && <p className="help">{def.help}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}
