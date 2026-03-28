import { indicadoresVendas } from '../../data/indicadores'
import { KpiCard } from '../../components/ui'

function HBarChart({ data, labelKey, valueKey, color = 'var(--color-brand-primary)' }: {
  data: Record<string, string | number>[]
  labelKey: string
  valueKey: string
  color?: string
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey])), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 160, fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'right', flexShrink: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {d[labelKey]}
          </div>
          <div style={{ flex: 1, background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-sm)', height: 20, overflow: 'hidden' }}>
            <div style={{ width: `${(Number(d[valueKey]) / max) * 100}%`, height: '100%', background: color, borderRadius: 'var(--radius-sm)', transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ width: 32, fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{d[valueKey]}</div>
        </div>
      ))}
    </div>
  )
}

function BarChart({ data, labelKey, valueKey, color = 'var(--color-brand-primary)' }: {
  data: Record<string, string | number>[]
  labelKey: string
  valueKey: string
  color?: string
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey])), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{d[valueKey]}</div>
          <div style={{ width: '100%', height: `${(Number(d[valueKey]) / max) * 88}px`, minHeight: 4, background: color, borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
          <div style={{ fontSize: 9, color: 'var(--color-text-muted)', textAlign: 'center', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 40 }}>
            {d[labelKey]}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function VendasTab() {
  const d = indicadoresVendas

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard label="Empresas Ativas" value={d.empresasAtivas} />
        <KpiCard label="Ticket Médio Novo Cliente" value={d.ticketMedioNovoCliente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <KpiCard label="Ticket Médio por Produto" value={d.ticketMedioPorProduto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <KpiCard label="Taxa Realização Reuniões" value={`${(d.taxaRealizacaoReunioes * 100).toFixed(0)}%`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Novos clientes por mês */}
        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Novos Clientes por Mês
          </h3>
          <BarChart data={d.novosPorMes} labelKey="mes" valueKey="novos" color="var(--color-brand-primary)" />
        </div>

        {/* Por segmento */}
        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Por Segmento
          </h3>
          <HBarChart data={d.porSegmento} labelKey="segmento" valueKey="total" color="var(--color-brand-accent)" />
        </div>
      </div>

      {/* Por colaborador */}
      <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Empresas Ativas por Colaborador
        </h3>
        <HBarChart data={d.porColaborador} labelKey="nome" valueKey="total" color="var(--color-success)" />
      </div>
    </div>
  )
}
