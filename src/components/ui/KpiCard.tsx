interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  unavailable?: boolean
  className?: string
}

export function KpiCard({ label, value, sub, unavailable = false, className = '' }: KpiCardProps) {
  return (
    <div
      style={{
        background: 'var(--color-bg-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
      }}
      className={className}
    >
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
        {label}
      </p>
      {unavailable ? (
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          Dado Indisponível
        </p>
      ) : (
        <>
          <p style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
            {value}
          </p>
          {sub && (
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {sub}
            </p>
          )}
        </>
      )}
    </div>
  )
}
