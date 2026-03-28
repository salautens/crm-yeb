import { Pagination } from '@heroui/react'

interface TablePaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TablePagination({ page, totalPages, onPageChange }: TablePaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div
      style={{ borderTop: '1px solid var(--color-border)', padding: '12px 16px' }}
      className="flex items-center justify-end"
    >
      <Pagination>
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous
              onClick={() => onPageChange(Math.max(1, page - 1))}
              aria-disabled={page === 1}
              className={page === 1 ? 'pointer-events-none opacity-40' : ''}
            >
              <Pagination.PreviousIcon />
            </Pagination.Previous>
          </Pagination.Item>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Pagination.Item key={p}>
              <Pagination.Link isActive={p === page} onClick={() => onPageChange(p)}>
                {p}
              </Pagination.Link>
            </Pagination.Item>
          ))}

          <Pagination.Item>
            <Pagination.Next
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              aria-disabled={page === totalPages}
              className={page === totalPages ? 'pointer-events-none opacity-40' : ''}
            >
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
    </div>
  )
}
