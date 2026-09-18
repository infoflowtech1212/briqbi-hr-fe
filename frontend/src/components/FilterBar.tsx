export interface SelectFilter {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters = [],
}: {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: SelectFilter[]
}) {
  if (!onSearchChange && filters.length === 0) return null

  return (
    <div className="filter-bar">
      {onSearchChange && (
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search ?? ''}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search"
        />
      )}
      {filters.map((f) => (
        <select key={f.label} value={f.value} onChange={(e) => f.onChange(e.target.value)} aria-label={f.label}>
          <option value="">{f.label}: All</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  )
}
