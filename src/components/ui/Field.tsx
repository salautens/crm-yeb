import React from 'react'

interface FieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
  style?: React.CSSProperties
  htmlFor?: string
}

export function Field({ label, required, children, style, htmlFor }: FieldProps) {
  return (
    <div style={style}>
      <label
        htmlFor={htmlFor}
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
          marginBottom: 6,
          display: 'flex',
          gap: 3,
          cursor: 'pointer',
        }}
      >
        {label}
        {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
      </label>
      {children}
    </div>
  )
}
