import { useNavigate } from 'react-router-dom'
import { empresas } from '../data/empresas'
import { segmentos } from '../data/segmentos'
import { EmpresaAlvoBadge } from '../components/ui'
import type { PipelineStage } from '../types'

const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'prospeccao',  label: 'Prospecção',  color: '#94A3B8' },
  { key: 'qualificacao', label: 'Qualificação', color: 'var(--color-brand-primary)' },
  { key: 'proposta',   label: 'Proposta',    color: '#D97706' },
  { key: 'negociacao', label: 'Negociação',  color: '#7C3AED' },
  { key: 'fechado',    label: 'Fechado',     color: 'var(--color-success)' },
]

export default function Pipeline() {
  const navigate = useNavigate()

  const empresasByStage = STAGES.map(({ key, label, color }) => ({
    key, label, color,
    items: empresas.filter((e) => e.pipeline === key),
  }))

  const total = empresas.length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Pipeline Comercial</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{total} empresas no funil</p>
        </div>
      </div>

      {/* Funnel summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {empresasByStage.map(({ key, label, color, items }) => (
          <div key={key} style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>{items.length}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
        {empresasByStage.map(({ key, label, color, items }) => (
          <div
            key={key}
            style={{ minWidth: 240, flex: '0 0 240px', background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
          >
            {/* Column header */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-bg-white)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>{items.length}</span>
            </div>

            {/* Cards */}
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200 }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)', fontSize: 12 }}>Nenhuma empresa</div>
              ) : (
                items.map((empresa) => {
                  const seg = segmentos.find((s) => s.id === empresa.segmentoId)
                  return (
                    <div
                      key={empresa.id}
                      onClick={() => navigate(`/cadastro/empresa/${empresa.id}`)}
                      style={{
                        background: 'var(--color-bg-white)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: 12,
                        cursor: 'pointer',
                        transition: 'box-shadow 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
                        {empresa.nomeFantasia || empresa.razaoSocial}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }}>{seg?.nome ?? '—'}</div>
                      <EmpresaAlvoBadge isAlvo={empresa.empresaAlvo} />
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
