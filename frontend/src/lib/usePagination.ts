import { useState } from 'react'

export function usePagination<T>(rows: T[], pageSize = 10) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const pageRows = rows.slice(start, start + pageSize)
  return { pageRows, page: safePage, setPage, totalPages }
}
