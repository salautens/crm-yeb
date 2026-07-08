import { useState, useEffect } from 'react'

interface ChartDataPoint {
  label: string
  agendamentos: number
  reunioes: number
}

// Mock de dados para os quick filters
const filterData = {
  'Esta semana': {
    agendamentos: 3,
    reunioes: 2,
    efetividade: 75.0,
    contatadas: 4,
    noShow: 10.0,
    noShowChange: '0.0%',
    agendamentoEfet: 50.0,
    agendamentoEfetChange: '+10.0%',
    avanco: 1,
    avancoChange: '0.0%',
    chart: [
      { label: 'Seg', agendamentos: 1, reunioes: 0 },
      { label: 'Ter', agendamentos: 0, reunioes: 1 },
      { label: 'Qua', agendamentos: 1, reunioes: 0 },
      { label: 'Qui', agendamentos: 0, reunioes: 0 },
      { label: 'Sex', agendamentos: 1, reunioes: 1 },
    ]
  },
  'Este mês': {
    agendamentos: 8,
    reunioes: 6,
    efetividade: 85.0,
    contatadas: 10,
    noShow: 12.5,
    noShowChange: '-2.0%',
    agendamentoEfet: 75.0,
    agendamentoEfetChange: '+15.0%',
    avanco: 3,
    avancoChange: '+5.0%',
    chart: [
      { label: 'Sem 1', agendamentos: 2, reunioes: 1 },
      { label: 'Sem 2', agendamentos: 3, reunioes: 2 },
      { label: 'Sem 3', agendamentos: 1, reunioes: 1 },
      { label: 'Sem 4', agendamentos: 2, reunioes: 2 },
    ]
  },
  'Último trimestre': {
    agendamentos: 24,
    reunioes: 19,
    efetividade: 88.0,
    contatadas: 32,
    noShow: 13.0,
    noShowChange: '+1.5%',
    agendamentoEfet: 80.0,
    agendamentoEfetChange: '+18.0%',
    avanco: 8,
    avancoChange: '+2.0%',
    chart: [
      { label: 'Abr', agendamentos: 7, reunioes: 5 },
      { label: 'Mai', agendamentos: 9, reunioes: 8 },
      { label: 'Jun', agendamentos: 8, reunioes: 6 },
    ]
  },
  'Este ano': {
    agendamentos: 12,
    reunioes: 10,
    efetividade: 90.0,
    contatadas: 15,
    noShow: 14.0,
    noShowChange: '0.0%',
    agendamentoEfet: 83.3,
    agendamentoEfetChange: '+22.5%',
    avanco: 4,
    avancoChange: '0.0%',
    chart: [
      { label: 'Jan', agendamentos: 2, reunioes: 1 },
      { label: 'Fev', agendamentos: 1, reunioes: 2 },
      { label: 'Mar', agendamentos: 3, reunioes: 1 },
      { label: 'Abr', agendamentos: 2, reunioes: 2 },
      { label: 'Mai', agendamentos: 4, reunioes: 3 },
      { label: 'Jun', agendamentos: 0, reunioes: 1 },
    ]
  }
}

function formatDate(dateStr: string, includeYear = false) {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.']
  const day = parseInt(parts[2], 10)
  const month = months[parseInt(parts[1], 10) - 1]
  const year = parts[0]
  return includeYear ? `${day} de ${month} de ${year}` : `${day} de ${month}`
}

function KpiCardDetailed({
  title,
  value,
  percentage,
  subtitle,
  isEstimado,
  alertText,
  isPercentageNegative
}: {
  title: string
  value: string | number
  percentage?: string
  subtitle?: string
  isEstimado?: boolean
  alertText?: string
  isPercentageNegative?: boolean
}) {
  return (
    <div style={{
      background: 'var(--color-bg-white)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxShadow: 'var(--shadow-card)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          {title}
        </span>
        {isEstimado && (
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'rgba(245,158,11,0.08)',
            color: '#D97706',
            letterSpacing: '0.05em'
          }}>
            ESTIMADO
          </span>
        )}
      </div>

      {/* Value row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {value}
        </span>
        {percentage && (
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 12,
            background: isPercentageNegative ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
            color: isPercentageNegative ? 'var(--color-danger)' : 'var(--color-success)',
          }}>
            {percentage}
          </span>
        )}
      </div>

      {/* Subtitle / Alert */}
      {subtitle && (
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {subtitle}
        </div>
      )}

      {alertText && (
        <div style={{
          marginTop: 'auto',
          paddingTop: 8,
          fontSize: 11,
          color: '#D97706',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 4,
          lineHeight: 1.4
        }}>
          <span style={{ fontSize: 12, flexShrink: 0 }}>⚠️</span>
          <span>{alertText}</span>
        </div>
      )}
    </div>
  )
}

function DualLineChart({ data }: { data: ChartDataPoint[] }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.agendamentos, d.reunioes)), 5)
  const height = 180
  const width = 600
  const paddingX = 40
  const paddingY = 20

  const chartHeight = height - paddingY * 2
  const chartWidth = width - paddingX * 2

  const pointsAgendamentos = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth
    const y = paddingY + chartHeight - (d.agendamentos / maxVal) * chartHeight
    return { x, y }
  })

  const pointsReunioes = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth
    const y = paddingY + chartHeight - (d.reunioes / maxVal) * chartHeight
    return { x, y }
  })

  const pathAgendamentos = pointsAgendamentos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const pathReunioes = pointsReunioes.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const areaAgendamentos = `${pathAgendamentos} L ${pointsAgendamentos[pointsAgendamentos.length - 1].x} ${height - paddingY} L ${pointsAgendamentos[0].x} ${height - paddingY} Z`
  const areaReunioes = `${pathReunioes} L ${pointsReunioes[pointsReunioes.length - 1].x} ${height - paddingY} L ${pointsReunioes[0].x} ${height - paddingY} Z`

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ position: 'relative', width: '100%', height: height }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="gradAgendamentos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradReunioes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = paddingY + (i / 4) * chartHeight
            const val = Math.round(maxVal - (i / 4) * maxVal)
            return (
              <g key={i}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                <text x={paddingX - 10} y={y + 4} fill="var(--color-text-muted)" fontSize="10" textAnchor="end">{val}</text>
              </g>
            )
          })}

          {/* Filled Areas */}
          <path d={areaAgendamentos} fill="url(#gradAgendamentos)" />
          <path d={areaReunioes} fill="url(#gradReunioes)" />

          {/* Lines */}
          <path d={pathAgendamentos} fill="none" stroke="var(--color-brand-primary)" strokeWidth="2.5" strokeLinecap="round" />
          <path d={pathReunioes} fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Points */}
          {pointsAgendamentos.map((p, i) => (
            <circle key={`a-${i}`} cx={p.x} cy={p.y} r="4" fill="var(--color-brand-primary)" stroke="var(--color-bg-white)" strokeWidth="1.5" />
          ))}
          {pointsReunioes.map((p, i) => (
            <circle key={`r-${i}`} cx={p.x} cy={p.y} r="4" fill="var(--color-success)" stroke="var(--color-bg-white)" strokeWidth="1.5" />
          ))}

          {/* X Axis labels */}
          {data.map((d, i) => {
            const x = paddingX + (i / (data.length - 1)) * chartWidth
            return (
              <text key={i} x={x} y={height - 2} fill="var(--color-text-muted)" fontSize="10" textAnchor="middle">
                {d.label}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, fontSize: 12, justifyContent: 'center', marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-brand-primary)' }} />
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Agendamentos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-success)' }} />
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Reuniões Realizadas</span>
        </div>
      </div>
    </div>
  )
}

export default function VendasTab() {
  const [quickFilter, setQuickFilter] = useState('Este ano')
  const [startDate, setStartDate] = useState('2026-01-01')
  const [endDate, setEndDate] = useState('2026-12-31')
  const [seller, setSeller] = useState('todos')

  // Ao mudar quick filter, ajusta as datas
  useEffect(() => {
    if (quickFilter === 'Esta semana') {
      setStartDate('2026-07-06')
      setEndDate('2026-07-12')
    } else if (quickFilter === 'Este mês') {
      setStartDate('2026-07-01')
      setEndDate('2026-07-31')
    } else if (quickFilter === 'Último trimestre') {
      setStartDate('2026-04-01')
      setEndDate('2026-06-30')
    } else if (quickFilter === 'Este ano') {
      setStartDate('2026-01-01')
      setEndDate('2026-12-31')
    }
  }, [quickFilter])

  const base = filterData[quickFilter as keyof typeof filterData] || filterData['Este ano']

  // Fator de escala por vendedor
  const factor = seller === 'todos' ? 1.0 : seller === 'laleska' ? 0.4 : seller === 'gaby' ? 0.3 : seller === 'rafael' ? 0.2 : 0.1

  const agendamentos = Math.max(1, Math.round(base.agendamentos * factor))
  const reunioes = Math.max(1, Math.round(base.reunioes * factor))
  const realizacao = agendamentos > 0 ? ((reunioes / agendamentos) * 100).toFixed(1) : '0.0'
  const contatadas = Math.max(1, Math.round(base.contatadas * factor))
  const efetividade = base.efetividade.toFixed(1)
  const noShow = base.noShow.toFixed(1)
  const agendamentoEfet = base.agendamentoEfet.toFixed(1)
  const avanco = Math.max(0, Math.round(base.avanco * factor))

  const chartData = base.chart.map(d => ({
    label: d.label,
    agendamentos: Math.max(0, Math.round(d.agendamentos * factor * 1.5)),
    reunioes: Math.max(0, Math.round(d.reunioes * factor * 1.5))
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Filters Bar */}
      <div style={{
        background: 'var(--color-bg-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Quick Filters */}
          <div style={{ display: 'flex', background: 'var(--color-bg-muted)', padding: 3, borderRadius: 8, gap: 2 }}>
            {['Esta semana', 'Este mês', 'Último trimestre', 'Este ano'].map((label) => (
              <button
                key={label}
                onClick={() => setQuickFilter(label)}
                style={{
                  padding: '6px 14px',
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background: quickFilter === label ? 'var(--color-bg-white)' : 'transparent',
                  color: quickFilter === label ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  boxShadow: quickFilter === label ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Date Picker Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-muted)' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setQuickFilter('')
              }}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                padding: '5px 10px',
                fontSize: 13,
                outline: 'none',
                background: 'var(--color-bg-white)',
                color: 'var(--color-text-primary)'
              }}
            />
            <span>até</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setQuickFilter('')
              }}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                padding: '5px 10px',
                fontSize: 13,
                outline: 'none',
                background: 'var(--color-bg-white)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>

          {/* Formatted Date Range Label */}
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {formatDate(startDate)} – {formatDate(endDate, true)}
          </div>
        </div>

        {/* Sellers Select */}
        <div>
          <select
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 500,
              outline: 'none',
              background: 'var(--color-bg-white)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer'
            }}
          >
            <option value="todos">Todos os vendedores</option>
            <option value="laleska">Laleska Silva</option>
            <option value="gaby">Gaby</option>
            <option value="rafael">Rafael Vendedor</option>
            <option value="lucas">Lucas SDR</option>
          </select>
        </div>
      </div>

      {/* KPI Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCardDetailed
          title="Agendamentos"
          value={agendamentos}
          subtitle="0 no período anterior"
        />
        <KpiCardDetailed
          title="Reuniões Realizadas"
          value={reunioes}
          subtitle="0 no período anterior"
        />
        <KpiCardDetailed
          title="Taxa de Realização"
          value={`${realizacao}%`}
          subtitle="Reuniões realizadas / agendamentos"
        />
        <KpiCardDetailed
          title="Empresas Contatadas"
          value={contatadas}
          subtitle="0 no período anterior"
        />
        <KpiCardDetailed
          title="Taxa de Efetividade"
          value={`${efetividade}%`}
          subtitle="Interações efetivas / total"
        />
        <KpiCardDetailed
          title="Taxa de No Show"
          value={`${noShow}%`}
          percentage={base.noShowChange}
          isPercentageNegative={base.noShowChange.startsWith('+')}
          isEstimado
          alertText="Dado estimado - Aguarda campo noShow na Interação"
        />
        <KpiCardDetailed
          title="Efetividade de Agendamento"
          value={`${agendamentoEfet}%`}
          percentage={base.agendamentoEfetChange}
          isPercentageNegative={base.agendamentoEfetChange.startsWith('-')}
          isEstimado
          alertText="Dado estimado - Aguarda parentInteracaoId + regra de negócio"
        />
        <KpiCardDetailed
          title="Empresas com Avanço"
          value={avanco}
          percentage={base.avancoChange}
          isPercentageNegative={base.avancoChange.startsWith('-')}
          isEstimado
          alertText="Dado estimado - Aguarda tabela pipeline_history"
        />
      </div>

      {/* Chart Section */}
      <div style={{
        background: 'var(--color-bg-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        boxShadow: 'var(--shadow-card)',
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Agendamentos e Reuniões por Semana
        </h3>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 20 }}>
          Empresas distintas · Indicadores 18 e 19
        </p>

        <DualLineChart data={chartData} />
      </div>
    </div>
  )
}
