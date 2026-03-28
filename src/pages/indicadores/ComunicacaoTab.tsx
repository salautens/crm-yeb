import { indicadoresComunicacao } from '../../data/indicadores'
import { KpiCard } from '../../components/ui'

function BarChart({ data, labelKey, valueKey, color = 'var(--color-brand-primary)' }: {
  data: Record<string, string | number>[]
  labelKey: string
  valueKey: string
  color?: string
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey])), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, padding: '0 8px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500 }}>{d[valueKey]}</div>
          <div
            style={{
              width: '100%',
              height: `${(Number(d[valueKey]) / max) * 88}px`,
              minHeight: 4,
              background: color,
              borderRadius: '3px 3px 0 0',
              opacity: 0.85,
              transition: 'height 0.3s ease',
            }}
          />
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: 48, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {d[labelKey]}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ComunicacaoTab() {
  const d = indicadoresComunicacao
  const canais = Object.entries(d.totalLeadsPorCanal).map(([canal, total]) => ({
    canal: canal.charAt(0).toUpperCase() + canal.slice(1),
    total,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard label="Taxa de Qualificação BD" value={`${(d.qualificacaoBD * 100).toFixed(0)}%`} />
        <KpiCard label="Leads para Reunião" value={d.leadsParaReuniao} />
        <KpiCard label="Leads para Fechamento" value={d.leadsParaFechamento} />
        <KpiCard label="Taxa de Conversão" value={d.taxaConversao === 0 ? '—' : `${(d.taxaConversao * 100).toFixed(0)}%`} unavailable={d.taxaConversao === 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Evolução mensal */}
        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Qualificações por Mês
          </h3>
          <BarChart data={d.evolucaoMensal} labelKey="mes" valueKey="qualificacoes" color="var(--color-brand-primary)" />
        </div>

        {/* Leads por canal */}
        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Leads por Canal
          </h3>
          <BarChart data={canais} labelKey="canal" valueKey="total" color="var(--color-brand-accent)" />
        </div>
      </div>

      {/* Tempo médio stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Tempo médio Lead → Reunião</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-brand-primary)', marginTop: 6 }}>{d.tempoMedioReuniao} dias</div>
        </div>
        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Tempo médio Lead → Fechamento</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-success)', marginTop: 6 }}>{d.tempoMedioFechamento} dias</div>
        </div>
      </div>
    </div>
  )
}
