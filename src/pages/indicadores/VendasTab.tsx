import { useState, useEffect } from 'react'

interface ChartDataPoint {
  label: string
  agendamentos: number
  reunioes: number
  contatadas: number
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
      { label: 'Seg', agendamentos: 1, reunioes: 0, contatadas: 2 },
      { label: 'Ter', agendamentos: 0, reunioes: 1, contatadas: 1 },
      { label: 'Qua', agendamentos: 1, reunioes: 0, contatadas: 1 },
      { label: 'Qui', agendamentos: 0, reunioes: 0, contatadas: 0 },
      { label: 'Sex', agendamentos: 1, reunioes: 1, contatadas: 0 },
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
      { label: 'Sem 1', agendamentos: 2, reunioes: 1, contatadas: 3 },
      { label: 'Sem 2', agendamentos: 3, reunioes: 2, contatadas: 4 },
      { label: 'Sem 3', agendamentos: 1, reunioes: 1, contatadas: 1 },
      { label: 'Sem 4', agendamentos: 2, reunioes: 2, contatadas: 2 },
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
      { label: 'Abr', agendamentos: 7, reunioes: 5, contatadas: 10 },
      { label: 'Mai', agendamentos: 9, reunioes: 8, contatadas: 12 },
      { label: 'Jun', agendamentos: 8, reunioes: 6, contatadas: 10 },
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
      { label: 'jan. de 26', agendamentos: 1, reunioes: 0, contatadas: 2 },
      { label: 'fev. de 26', agendamentos: 1, reunioes: 3, contatadas: 4 },
      { label: 'mar. de 26', agendamentos: 1, reunioes: 1, contatadas: 2 },
      { label: 'abr. de 26', agendamentos: 7, reunioes: 3, contatadas: 9 },
      { label: 'mai. de 26', agendamentos: 3, reunioes: 4, contatadas: 5 },
      { label: 'jun. de 26', agendamentos: 1, reunioes: 1, contatadas: 2 },
      { label: 'jul. de 26', agendamentos: 1, reunioes: 1, contatadas: 2 },
      { label: 'ago. de 26', agendamentos: 1, reunioes: 1, contatadas: 2 },
      { label: 'set. de 26', agendamentos: 1, reunioes: 1, contatadas: 2 },
      { label: 'out. de 26', agendamentos: 1, reunioes: 1, contatadas: 2 },
      { label: 'nov. de 26', agendamentos: 1, reunioes: 1, contatadas: 2 },
      { label: 'dez. de 26', agendamentos: 1, reunioes: 1, contatadas: 2 },
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

function LineChart({
  data,
  showAgendamentos,
  showReunioes,
  showContatadas,
  hoveredIdx,
  setHoveredIdx
}: {
  data: ChartDataPoint[]
  showAgendamentos: boolean
  showReunioes: boolean
  showContatadas: boolean
  hoveredIdx: number | null
  setHoveredIdx: (i: number | null) => void
}) {
  const maxVal = Math.max(...data.map(d => Math.max(d.agendamentos, d.reunioes, d.contatadas)), 5)
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

  const pointsContatadas = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth
    const y = paddingY + chartHeight - (d.contatadas / maxVal) * chartHeight
    return { x, y }
  })

  const getPath = (points: { x: number; y: number }[]) => {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: height }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
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

        {/* Lines */}
        {showAgendamentos && (
          <path d={getPath(pointsAgendamentos)} fill="none" stroke="var(--color-brand-primary)" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {showReunioes && (
          <path d={getPath(pointsReunioes)} fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {showContatadas && (
          <path d={getPath(pointsContatadas)} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Hover Line */}
        {hoveredIdx !== null && (
          <line
            x1={paddingX + (hoveredIdx / (data.length - 1)) * chartWidth}
            y1={paddingY}
            x2={paddingX + (hoveredIdx / (data.length - 1)) * chartWidth}
            y2={height - paddingY}
            stroke="var(--color-border)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        )}

        {/* Points */}
        {data.map((_, i) => {
          const x = paddingX + (i / (data.length - 1)) * chartWidth
          const isHovered = hoveredIdx === i
          const r = isHovered ? 6 : 4
          return (
            <g key={i}>
              {showAgendamentos && (
                <circle cx={x} cy={pointsAgendamentos[i].y} r={r} fill="var(--color-brand-primary)" stroke="var(--color-bg-white)" strokeWidth="1.5" />
              )}
              {showReunioes && (
                <circle cx={x} cy={pointsReunioes[i].y} r={r} fill="var(--color-success)" stroke="var(--color-bg-white)" strokeWidth="1.5" />
              )}
              {showContatadas && (
                <circle cx={x} cy={pointsContatadas[i].y} r={r} fill="#8b5cf6" stroke="var(--color-bg-white)" strokeWidth="1.5" />
              )}
            </g>
          )
        })}

        {/* X Axis labels */}
        {data.map((d, i) => {
          const x = paddingX + (i / (data.length - 1)) * chartWidth
          return (
            <text key={i} x={x} y={height - 2} fill="var(--color-text-muted)" fontSize="9" textAnchor="middle">
              {d.label}
            </text>
          )
        })}

        {/* Interactive Hover Zones */}
        {data.map((_, i) => {
          const x = paddingX + (i / (data.length - 1)) * chartWidth
          return (
            <rect
              key={i}
              x={x - 15}
              y={paddingY}
              width="30"
              height={chartHeight}
              fill="transparent"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            />
          )
        })}
      </svg>
    </div>
  )
}

function DoughnutChart({ data }: { data: { label: string; percentage: number; color: string }[] }) {
  const r = 32
  const circ = 2 * Math.PI * r
  let accumulated = 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ width: 110, height: 110, flexShrink: 0 }}>
        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
          {data.map((seg, i) => {
            const offset = (accumulated / 100) * circ
            accumulated += seg.percentage
            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={r}
                fill="transparent"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${(seg.percentage / 100) * circ} ${circ}`}
                strokeDashoffset={-offset}
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          })}
          <circle cx="50" cy="50" r="25" fill="var(--color-bg-white)" />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {data.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, overflow: 'hidden' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seg.label}</span>
            </div>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginLeft: 'auto' }}>{seg.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FunnelChart({ data }: { data: { label: string; value: number; sub: string; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
      {/* Funnel bars */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
        {data.map((item, i) => {
          const widthPct = Math.max(8, (item.value / max) * 100)
          return (
            <div key={i} style={{ height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  width: `${widthPct}%`,
                  height: '100%',
                  background: item.color,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 12,
                  transition: 'width 0.3s ease'
                }}
              >
                {item.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* Funnel labels */}
      <div style={{ width: 180, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
        {data.map((item, i) => (
          <div key={i} style={{ height: 26, display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: 11 }}>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</div>
            {item.sub && (
              <div style={{ fontSize: 9, color: item.sub.startsWith('0%') ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                {item.sub}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function VendasTab() {
  const [quickFilter, setQuickFilter] = useState('Este ano')
  const [startDate, setStartDate] = useState('2026-01-01')
  const [endDate, setEndDate] = useState('2026-12-31')
  const [seller, setSeller] = useState('todos')

  // States para a interatividade do gráfico de evolução
  const [showAgendamentos, setShowAgendamentos] = useState(true)
  const [showReunioes, setShowReunioes] = useState(true)
  const [showContatadas, setShowContatadas] = useState(false)
  const [hoveredIdxWeekly, setHoveredIdxWeekly] = useState<number | null>(null)
  const [hoveredIdxEvolucao, setHoveredIdxEvolucao] = useState<number | null>(null)

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
    agendamentos: Math.max(0, Math.round(d.agendamentos * factor)),
    reunioes: Math.max(0, Math.round(d.reunioes * factor)),
    contatadas: Math.max(0, Math.round(d.contatadas * factor))
  }))

  const doughnutData = [
    { label: 'Tentativa de Agendamento', percentage: 40, color: '#163880' },
    { label: 'Reunião', percentage: 20, color: '#10B981' },
    { label: 'Qualificação BD', percentage: 17, color: '#d97706' },
    { label: 'Proposta Enviada', percentage: 10, color: '#8b5cf6' },
    { label: 'Reunião Presencial', percentage: 7, color: '#ec4899' },
    { label: 'Videoconferência', percentage: 7, color: '#06b6d4' }
  ]

  const funnelData = [
    { label: 'Empresas Contatadas', value: Math.max(1, Math.round(15 * factor)), sub: '', color: '#163880' },
    { label: 'Agendamentos', value: Math.max(1, Math.round(10 * factor)), sub: '67% da etapa anterior', color: '#3B82F6' },
    { label: 'Reuniões Realizadas', value: Math.max(1, Math.round(9 * factor)), sub: '90% da etapa anterior', color: '#10B981' },
    { label: 'Propostas Enviadas', value: Math.max(1, Math.round(3 * factor)), sub: '33% da etapa anterior', color: '#d97706' },
    { label: 'Contratos Fechados', value: 0, sub: '0% da etapa anterior', color: '#22C55E' }
  ]

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

      {/* Row 1: Weekly Chart and Type Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Weekly Chart */}
        <div style={{
          background: 'var(--color-bg-white)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          boxShadow: 'var(--shadow-card)',
          position: 'relative'
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Agendamentos e Reuniões por Semana
          </h3>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 20 }}>
            Empresas distintas · Indicadores 18 e 19
          </p>

          <LineChart
            data={chartData}
            showAgendamentos={true}
            showReunioes={true}
            showContatadas={false}
            hoveredIdx={hoveredIdxWeekly}
            setHoveredIdx={setHoveredIdxWeekly}
          />

          {/* Legends */}
          <div style={{ display: 'flex', gap: 16, fontSize: 12, justifyContent: 'center', marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-brand-primary)' }} />
              <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Agendamentos (emp. distintas)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-success)' }} />
              <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Reuniões realizadas (emp. distintas)</span>
            </div>
          </div>

          {/* Tooltip */}
          {hoveredIdxWeekly !== null && (
            <div style={{
              position: 'absolute',
              left: `${50 + (hoveredIdxWeekly / (chartData.length - 1)) * 40}%`,
              top: '40px',
              background: 'var(--color-bg-white)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '8px 12px',
              boxShadow: 'var(--shadow-dropdown)',
              pointerEvents: 'none',
              zIndex: 10,
              fontSize: 11,
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{chartData[hoveredIdxWeekly].label}</div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-brand-primary)' }}>Agendamentos:</span>
                <span style={{ fontWeight: 600 }}>{chartData[hoveredIdxWeekly].agendamentos}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-success)' }}>Reuniões:</span>
                <span style={{ fontWeight: 600 }}>{chartData[hoveredIdxWeekly].reunioes}</span>
              </div>
            </div>
          )}
        </div>

        {/* Type Distribution */}
        <div style={{
          background: 'var(--color-bg-white)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          boxShadow: 'var(--shadow-card)'
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Distribuição por Tipo
          </h3>
          <DoughnutChart data={doughnutData} />
        </div>
      </div>

      {/* Row 2: Indicators Evolution and Conversion Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Indicators Evolution */}
        <div style={{
          background: 'var(--color-bg-white)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          boxShadow: 'var(--shadow-card)',
          position: 'relative'
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Evolução de Indicadores
          </h3>

          {/* Interactive Pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button
              onClick={() => setShowAgendamentos(!showAgendamentos)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                border: `1.5px solid ${showAgendamentos ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
                background: showAgendamentos ? 'rgba(45,88,232,0.06)' : 'var(--color-bg-white)',
                color: showAgendamentos ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-brand-primary)' }} />
              Agendamentos
            </button>

            <button
              onClick={() => setShowReunioes(!showReunioes)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                border: `1.5px solid ${showReunioes ? 'var(--color-success)' : 'var(--color-border)'}`,
                background: showReunioes ? 'rgba(16,185,129,0.06)' : 'var(--color-bg-white)',
                color: showReunioes ? 'var(--color-success)' : 'var(--color-text-secondary)',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
              Reuniões Realizadas
            </button>

            <button
              onClick={() => setShowContatadas(!showContatadas)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                border: `1.5px solid ${showContatadas ? '#8b5cf6' : 'var(--color-border)'}`,
                background: showContatadas ? 'rgba(139,92,246,0.06)' : 'var(--color-bg-white)',
                color: showContatadas ? '#8b5cf6' : 'var(--color-text-secondary)',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />
              Empresas Contatadas
            </button>
          </div>

          <LineChart
            data={chartData}
            showAgendamentos={showAgendamentos}
            showReunioes={showReunioes}
            showContatadas={showContatadas}
            hoveredIdx={hoveredIdxEvolucao}
            setHoveredIdx={setHoveredIdxEvolucao}
          />

          {/* Tooltip */}
          {hoveredIdxEvolucao !== null && (
            <div style={{
              position: 'absolute',
              left: `${15 + (hoveredIdxEvolucao / (chartData.length - 1)) * 60}%`,
              top: '80px',
              background: 'var(--color-bg-white)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '8px 12px',
              boxShadow: 'var(--shadow-dropdown)',
              pointerEvents: 'none',
              zIndex: 10,
              fontSize: 11,
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{chartData[hoveredIdxEvolucao].label}</div>
              {showAgendamentos && (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-brand-primary)' }}>Agendamentos:</span>
                  <span style={{ fontWeight: 600 }}>{chartData[hoveredIdxEvolucao].agendamentos}</span>
                </div>
              )}
              {showReunioes && (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-success)' }}>Reuniões Realizadas:</span>
                  <span style={{ fontWeight: 600 }}>{chartData[hoveredIdxEvolucao].reunioes}</span>
                </div>
              )}
              {showContatadas && (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                  <span style={{ color: '#8b5cf6' }}>Empresas Contatadas:</span>
                  <span style={{ fontWeight: 600 }}>{chartData[hoveredIdxEvolucao].contatadas}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conversion Pipeline */}
        <div style={{
          background: 'var(--color-bg-white)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          boxShadow: 'var(--shadow-card)'
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pipeline de Conversão
          </h3>
          <FunnelChart data={funnelData} />
        </div>
      </div>
    </div>
  )
}
