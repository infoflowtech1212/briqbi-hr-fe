import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  label: string
  render: (row: T) => ReactNode
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyText,
}: {
  columns: Column<T>[]
  rows: T[] | null
  emptyText: string
}) {
  if (rows === null) return <p className="help">Loading…</p>
  if (rows.length === 0) return <p className="help">{emptyText}</p>

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((c) => (
                <td key={c.key}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
