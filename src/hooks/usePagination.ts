import { useState, useMemo } from 'react'

export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  const paginated = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  )

  const goNext = () => setPage((p) => Math.min(totalPages, p + 1))
  const goPrev = () => setPage((p) => Math.max(1, p - 1))

  // Reset to page 1 when items change (e.g. after filter)
  const reset = () => setPage(1)

  return { page, setPage, totalPages, paginated, goNext, goPrev, reset }
}
