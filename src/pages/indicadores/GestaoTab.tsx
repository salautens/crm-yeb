import { indicadoresGestao } from '../../data/indicadores'
import { KpiCard } from '../../components/ui'
import { ContractStatusBadge } from '../../components/ui/StatusBadge'

function LineChart({ data, labelKey, valueKey, color = 'var(--color-brand-primary)' }: {
  data: Record<string, string | number>[]
  labelKey: string
  valueKey: string
  color?: string
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey])), 1)
  const min = Math.min(...data.map((d) => Number(d[valueKey])))
  const range = max - min || 1
  const H = 80
  const W = 100 / (data.length - 1)

  const points = data.map((d, i) => ({
    x: i * W,
    y: H - ((Number(d[valueKey]) - min) / range) * H,
    label: String(d[labelKey]),
    value: Number(d[valueKey]),
  }))

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div>
      <svg viewBox={`0 0 100 ${H + 20}`} style={{ width: '100%', height: 120, overflow: 'visible' }}>
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {data.filter((_, i) => i % 2 === 0).map((d, i) => (
          <span key={i} style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>{d[labelKey]}</span>
        ))}
      </div>
    </div>
  )
}

export default function GestaoTab() {
  const d = indicadoresGestao
  const totalRegularizacao = d.regularizacao.regular + d.regularizacao.pendente
  const regularPct = Math.round((d.regularizacao.regular / totalRegularizacao) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard label="Total de Clientes" value={d.totalClientes} />
        <KpiCard label="Regularização Regular" value={`${d.regularizacao.regular} (${regularPct}%)`} />
        <KpiCard label="Regularização Pendente" value={d.regularizacao.pendente} />
        <KpiCard label="Pontos de Contato (Últ. mês)" value={d.pontosContato[d.pontosContato.length - 1].pontos} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Evolução de clientes */}
        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Evolução de Clientes
          </h3>
          <LineChart data={d.evolucaoMensal} labelKey="mes" valueKey="clientes" color="var(--color-brand-primary)" />
        </div>

        {/* Pontos de contato */}
        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pontos de Contato por Mês
          </h3>
          <LineChart data={d.pontosContato} labelKey="mes" valueKey="pontos" color="var(--color-brand-accent)" />
        </div>
      </div>

      {/* Regularização bar */}
      <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Status de Regularização
        </h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ height: 20, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'rgba(239,68,68,0.15)', display: 'flex' }}>
              <div style={{ width: `${regularPct}%`, background: 'var(--color-success)', transition: 'width 0.3s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>✓ {d.regularizacao.regular} Regular</span>
            <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>⚠ {d.regularizacao.pendente} Pendente</span>
          </div>
        </div>
      </div>

      {/* Vencimentos */}
      <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Contratos a Vencer
          </h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Empresa', 'Vencimento', 'Dias Restantes', 'Status'].map((h) => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.vencimentos.map((v, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{v.empresa}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {new Date(v.dataVencimento).toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: v.diasRestantes <= 30 ? 'var(--color-danger)' : v.diasRestantes <= 90 ? '#D97706' : 'var(--color-success)',
                  }}>
                    {v.diasRestantes > 365 ? `${Math.round(v.diasRestantes / 365)} anos` : `${v.diasRestantes} dias`}
                  </span>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <ContractStatusBadge status={v.diasRestantes <= 30 ? 'vencendo' : 'ativo'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
