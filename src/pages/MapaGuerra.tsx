import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { empresas } from '../data/empresas'
import { segmentos } from '../data/segmentos'
import type { PipelineStage } from '../types'

const STAGES: { key: PipelineStage; label: string }[] = [
  { key: 'prospeccao',  label: 'Prospecção'  },
  { key: 'qualificacao', label: 'Qualificação' },
  { key: 'proposta',   label: 'Proposta'    },
  { key: 'negociacao', label: 'Negociação'  },
  { key: 'fechado',    label: 'Fechado'     },
]

function heatColor(value: number, max: number) {
  if (value === 0) return 'var(--color-bg-muted)'
  const intensity = value / max
  if (intensity < 0.33) return 'rgba(29,78,216,0.12)'
  if (intensity < 0.66) return 'rgba(29,78,216,0.30)'
  return 'rgba(29,78,216,0.55)'
}

export default function MapaGuerra() {
  const navigate = useNavigate()

  const matrix = useMemo(() => {
    return segmentos.map((seg) => {
      const row = STAGES.map(({ key }) => ({
        stage: key,
        count: empresas.filter((e) => e.segmentoId === seg.id && e.pipeline === key).length,
        alvo: empresas.filter((e) => e.segmentoId === seg.id && e.pipeline === key && e.empresaAlvo).length,
        items: empresas.filter((e) => e.segmentoId === seg.id && e.pipeline === key),
      }))
      const total = row.reduce((s, c) => s + c.count, 0)
      return { segmento: seg, row, total }
    }).filter((r) => r.total > 0)
  }, [])

  const maxCell = useMemo(() => Math.max(...matrix.flatMap((r) => r.row.map((c) => c.count))), [matrix])

  const totalByStage = STAGES.map(({ key }) => empresas.filter((e) => e.pipeline === key).length)
  const totalAlvo = empresas.filter((e) => e.empresaAlvo).length
  const totalEmpresas = empresas.length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Mapa de Guerra</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Distribuição de {totalEmpresas} empresas por segmento e etapa do pipeline · {totalAlvo} alvos
          </p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {STAGES.map(({ key, label }, i) => (
          <div key={key} style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-brand-primary)' }}>{totalByStage[i]}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Matrix */}
      <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: 200 }}>
                Segmento
              </th>
              {STAGES.map(({ key, label }) => (
                <th key={key} style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </th>
              ))}
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {matrix.map(({ segmento, row, total }) => (
              <tr key={segmento.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {segmento.nome}
                </td>
                {row.map((cell) => (
                  <td key={cell.stage} style={{ padding: '8px 16px', textAlign: 'center' }}>
                    {cell.count > 0 ? (
                      <div
                        style={{
                          display: 'inline-flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: heatColor(cell.count, maxCell),
                          cursor: 'pointer',
                          minWidth: 48,
                          transition: 'opacity 0.15s',
                        }}
                        onClick={() => navigate(`/base-dados`)}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                        title={`${cell.count} empresa${cell.count !== 1 ? 's' : ''}${cell.alvo > 0 ? ` (${cell.alvo} alvo${cell.alvo !== 1 ? 's' : ''})` : ''}`}
                      >
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-brand-primary)' }}>{cell.count}</span>
                        {cell.alvo > 0 && (
                          <span style={{ fontSize: 9, color: 'var(--color-brand-dark)', fontWeight: 600, marginTop: 1 }}>
                            {cell.alvo} alvo
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-border)', fontSize: 14 }}>—</span>
                    )}
                  </td>
                ))}
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-secondary)' }}>{total}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--color-border)', background: 'var(--color-bg-muted)' }}>
              <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Total</td>
              {totalByStage.map((t, i) => (
                <td key={i} style={{ padding: '12px 16px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{t}</td>
              ))}
              <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--color-brand-primary)' }}>{totalEmpresas}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Intensidade:</span>
        {[
          { bg: 'var(--color-bg-muted)', label: '0' },
          { bg: 'rgba(29,78,216,0.12)', label: '1' },
          { bg: 'rgba(29,78,216,0.30)', label: '2-3' },
          { bg: 'rgba(29,78,216,0.55)', label: '4+' },
        ].map(({ bg, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: bg, border: '1px solid var(--color-border)' }} />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
