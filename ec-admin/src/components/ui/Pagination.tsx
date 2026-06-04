import Button from './Button'

type PaginationProps = {
  totalPages: number
  page: number
  totalRecords: number
  onPageChange: (value: number | ((page: number) => number)) => void
  itemsPerPage: number
  onItemsPerPageChange: (value: number) => void
}

export default function Pagination({
  totalPages,
  page,
  totalRecords,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
}: PaginationProps) {
  if (!totalPages) return null

  return (
    <div className="flex items-center justify-between rounded-[26px] border border-t-0 border-[var(--line)] bg-[rgba(22,31,53,0.9)] px-6 py-4">
      <p className="text-sm text-[var(--muted)]">
        Page {page} of {totalPages} ({totalRecords} total)
      </p>
      <div className="flex items-center gap-3">
        <label
          htmlFor="items-per-page"
          className="font-mono text-xs uppercase tracking-[0.2em] text-[#cfd8ff]"
        >
          Items per page
        </label>
        <select
          id="items-per-page"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="min-w-[96px] rounded-[16px] border border-[var(--line)] bg-[#0d1427] px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-[#d3dbff] focus:shadow-[0_0_0_3px_rgba(188,202,255,0.14)]"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange((p) => Math.max(1, p - 1))}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          }
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2
            )
            .map((p, idx, arr) => (
              <span key={p} className="contents">
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="px-1 text-[var(--muted)]">...</span>
                )}
                <button
                  onClick={() => onPageChange(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
                    p === page
                      ? 'bg-[#cad3ff] text-[#17213c] font-semibold'
                      : 'text-[#b1bad7] hover:bg-white/6 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          }
        >
          Next
        </Button>
        </div>
      </div>
    </div>
  )
}
