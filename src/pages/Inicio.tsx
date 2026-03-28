import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Dropdown } from '@heroui/react'
import { empresas, updateEmpresa } from '../data/empresas'
import { segmentos } from '../data/segmentos'
import { atividades } from '../data/atividades'
import { contratos } from '../data/contratos'
import { Badge } from '../components/ui/Badge'
import { EmpresaAlvoBadge } from '../components/ui/StatusBadge'
import type { PipelineStage, Prioridade } from '../types'

const pipelineMap: Record<PipelineStage, { label: string; variant: 'neutral' | 'brand' | 'pending' | 'active' }> = {
  prospeccao:  { label: 'Prospecção',  variant: 'neutral'  },
  qualificacao: { label: 'Qualificação', variant: 'brand'  },
  proposta:    { label: 'Proposta',    variant: 'pending'  },
  negociacao:  { label: 'Negociação',  variant: 'pending'  },
  fechado:     { label: 'Fechado',     variant: 'active'   },
}

const prioridadeVariant: Record<Prioridade, 'danger' | 'pending' | 'neutral'> = {
  Alta: 'danger',
  Media: 'pending',
  Baixa: 'neutral',
}

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']

function getWeekDays() {
  const today = new Date()
  const dow = today.getDay() // 0=Sun
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dow === 0 ? 7 : dow) - 1))
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export default function Inicio() {
  const navigate = useNavigate()
  const [favoritas, setFavoritas] = useState(empresas.filter((e) => e.favorita))

  const weekDays = getWeekDays()
  const atividadesPorDia = weekDays.map((day) => ({
    day,
    items: atividades.filter((a) => {
      const d = new Date(a.inicio)
      return d.toDateString() === day.toDateString()
    }),
  }))

  const totalAlvo = empresas.filter((e) => e.empresaAlvo).length
  const contratosAtivos = contratos.filter((c) => c.status === 'ativo').length
  const hoje = new Date().toDateString()
  const atividadesHoje = atividades.filter((a) => new Date(a.inicio).toDateString() === hoje).length

  const handleToggleFavorita = (id: number, currentVal: boolean) => {
    updateEmpresa(id, { favorita: !currentVal })
    setFavoritas(empresas.filter((e) => e.favorita))
  }

  const kpis = [
    { label: 'Total de Empresas', value: empresas.length },
    { label: 'Empresas Alvo', value: totalAlvo },
    { label: 'Contratos Ativos', value: contratosAtivos },
    { label: 'Atividades Hoje', value: atividadesHoje },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-brand-primary)' }}>{kpi.value}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Empresas Favoritas */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>
          Empresas Favoritas
        </h2>
        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {favoritas.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
              Nenhuma empresa marcada como favorita.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Empresa', 'Segmento', 'Pipeline', 'Alvo', ''].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {favoritas.map((empresa) => {
                  const seg = segmentos.find((s) => s.id === empresa.segmentoId)
                  const pipeline = pipelineMap[empresa.pipeline]
                  return (
                    <tr key={empresa.id} style={{ borderBottom: '1px solid var(--color-border)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-muted)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{empresa.razaoSocial}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{empresa.cnpj}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{seg?.nome ?? '—'}</td>
                      <td style={{ padding: '12px 16px' }}><Badge variant={pipeline.variant}>{pipeline.label}</Badge></td>
                      <td style={{ padding: '12px 16px' }}><EmpresaAlvoBadge isAlvo={empresa.empresaAlvo} /></td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <Dropdown>
                          <Dropdown.Trigger>
                            <Button variant="ghost" style={{ fontSize: 16 }}>⋯</Button>
                          </Dropdown.Trigger>
                          <Dropdown.Popover>
                            <Dropdown.Menu>
                              <Dropdown.Item onPress={() => navigate(`/cadastro/empresa/${empresa.id}`)}>
                                Ver Detalhes
                              </Dropdown.Item>
                              <Dropdown.Item onPress={() => handleToggleFavorita(empresa.id, empresa.favorita)}>
                                Remover dos Favoritos
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown.Popover>
                        </Dropdown>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Atividades da Semana */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>
          Atividades da Semana
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {atividadesPorDia.map(({ day, items }, i) => {
            const isToday = day.toDateString() === new Date().toDateString()
            return (
              <div
                key={i}
                style={{
                  background: 'var(--color-bg-white)',
                  border: `1px solid ${isToday ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  minHeight: 120,
                }}
              >
                <div style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--color-border)',
                  background: isToday ? 'rgba(29,78,216,0.06)' : 'var(--color-bg-muted)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: isToday ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span>{DIAS[i]}</span>
                  <span style={{ opacity: 0.6 }}>{day.getDate()}/{String(day.getMonth() + 1).padStart(2, '0')}</span>
                </div>
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>—</div>
                  ) : (
                    items.map((ativ) => (
                      <div
                        key={ativ.id}
                        style={{
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-bg-muted)',
                          borderLeft: `3px solid ${ativ.prioridade === 'Alta' ? 'var(--color-danger)' : ativ.prioridade === 'Media' ? '#D97706' : 'var(--color-text-muted)'}`,
                        }}
                      >
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                          {new Date(ativ.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>{ativ.titulo}</div>
                        <div style={{ marginTop: 4 }}>
                          <Badge variant={prioridadeVariant[ativ.prioridade]}>{ativ.prioridade}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
