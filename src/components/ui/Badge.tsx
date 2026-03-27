interface BadgeProps {
  variant?: 'active' | 'inactive' | 'pending' | 'danger' | 'brand' | 'neutral'
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<string, React.CSSProperties> = {
  active:  { background: 'rgba(16,185,129,0.12)', color: '#10B981' },
  inactive: { background: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' },
  pending: { background: 'rgba(245,158,11,0.12)', color: '#D97706' },
  danger:  { background: 'rgba(239,68,68,0.10)', color: 'var(--color-danger)' },
  brand:   { background: 'rgba(29,78,216,0.10)', color: 'var(--color-brand-primary)' },
  neutral: { background: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)' },
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      style={{
        ...variantStyles[variant],
        borderRadius: 'var(--radius-full)',
        fontSize: 12,
        fontWeight: 500,
        padding: '2px 8px',
        display: 'inline-flex',
        alignItems: 'center',
      }}
      className={className}
    >
      {children}
    </span>
  )
}
