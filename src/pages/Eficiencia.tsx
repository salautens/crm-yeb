import { useState } from 'react'
import { Button, Modal, useOverlayState } from '@heroui/react'
import { atividades as initialAtividades } from '../data/atividades'
import { Badge } from '../components/ui/Badge'
import type { Atividade, Prioridade } from '../types'

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']

const prioridadeVariant: Record<Prioridade, 'danger' | 'pending' | 'neutral'> = {
  Alta: 'danger', Media: 'pending', Baixa: 'neutral',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  fontSize: 14,
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-bg-white)',
  color: 'var(--color-text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4, display: 'block',
}

const EMPTY_FORM = {
  titulo: '', acao: '', prioridade: 'Alta' as Prioridade,
  inicio: '', fim: '', prazo: '',
}

function getWeekDays(offset = 0) {
  const today = new Date()
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dow === 0 ? 7 : dow) - 1) + offset * 7)
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export default function Eficiencia() {
  const [dados, setDados] = useState(initialAtividades)
  const [weekOffset, setWeekOffset] = useState(0)
  const [form, setForm] = useState(EMPTY_FORM)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const modalState = useOverlayState()

  const weekDays = getWeekDays(weekOffset)

  const atividadesPorDia = weekDays.map((day) => ({
    day,
    items: dados.filter((a) => {
      const d = new Date(a.inicio)
      return d.toDateString() === day.toDateString()
    }),
  }))

  const totalSemana = atividadesPorDia.reduce((sum, d) => sum + d.items.length, 0)
  const hoje = new Date().toDateString()

  const handleSave = () => {
    const novaAtividade: Atividade = {
      id: Date.now(),
      usuarioId: 3,
      titulo: form.titulo,
      acao: form.acao,
      etapas: [],
      prioridade: form.prioridade,
      inicio: form.inicio,
      fim: form.fim,
      prazo: form.prazo,
    }
    setDados((prev) => [...prev, novaAtividade])
    setForm(EMPTY_FORM)
    modalState.close()
  }

  const setF = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const weekLabel = weekOffset === 0 ? 'Esta semana' : weekOffset === -1 ? 'Semana passada' : weekOffset === 1 ? 'Próxima semana' : `Semana ${weekOffset > 0 ? '+' : ''}${weekOffset}`

  const monthYear = weekDays[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Eficiência</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2, textTransform: 'capitalize' }}>
            {weekLabel} · {monthYear} · {totalSemana} atividade{totalSemana !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onPress={() => setWeekOffset((o) => o - 1)} style={{ fontSize: 13 }}>← Anterior</Button>
          {weekOffset !== 0 && <Button variant="ghost" onPress={() => setWeekOffset(0)} style={{ fontSize: 13 }}>Hoje</Button>}
          <Button variant="outline" onPress={() => setWeekOffset((o) => o + 1)} style={{ fontSize: 13 }}>Próxima →</Button>
          <Button variant="primary" onPress={modalState.open}>+ Nova Atividade</Button>
        </div>
      </div>

      {/* Week grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {atividadesPorDia.map(({ day, items }, i) => {
          const isToday = day.toDateString() === hoje
          return (
            <div
              key={i}
              style={{
                background: 'var(--color-bg-white)',
                border: `1px solid ${isToday ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                minHeight: 240,
              }}
            >
              {/* Day header */}
              <div style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--color-border)',
                background: isToday ? 'rgba(29,78,216,0.06)' : 'var(--color-bg-muted)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: isToday ? 'var(--color-brand-primary)' : 'var(--color-text-primary)' }}>
                  {DIAS[i]}
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: isToday ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)' }}>
                  {day.getDate()}
                </span>
                {items.length > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, background: isToday ? 'var(--color-brand-primary)' : 'var(--color-border)', color: isToday ? '#fff' : 'var(--color-text-secondary)', borderRadius: 'var(--radius-full)', padding: '1px 6px' }}>
                    {items.length}
                  </span>
                )}
              </div>

              {/* Activities */}
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)', fontSize: 12 }}>Sem atividades</div>
                ) : (
                  items.map((ativ) => (
                    <div
                      key={ativ.id}
                      onClick={() => setExpandedId(expandedId === ativ.id ? null : ativ.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg-muted)',
                        borderLeft: `3px solid ${ativ.prioridade === 'Alta' ? 'var(--color-danger)' : ativ.prioridade === 'Media' ? '#D97706' : '#94A3B8'}`,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {new Date(ativ.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} – {new Date(ativ.fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <Badge variant={prioridadeVariant[ativ.prioridade]}>{ativ.prioridade}</Badge>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>{ativ.titulo}</div>
                      {expandedId === ativ.id && (
                        <div style={{ marginTop: 6 }}>
                          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{ativ.acao}</div>
                          {ativ.etapas && ativ.etapas.length > 0 && (
                            <ul style={{ margin: '6px 0 0 12px', padding: 0, listStyle: 'disc' }}>
                              {ativ.etapas.map((e, i) => (
                                <li key={i} style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{e}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Nova Atividade modal */}
      <Modal isOpen={modalState.isOpen} onOpenChange={modalState.setOpen}>
        <Modal.Backdrop>
          <Modal.Container size="md">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Nova Atividade</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Título *</label>
                    <input style={inputStyle} value={form.titulo} onChange={(e) => setF('titulo', e.target.value)} placeholder="Ex: Visita Agromax" />
                  </div>
                  <div>
                    <label style={labelStyle}>Descrição / Ação</label>
                    <textarea
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
                      value={form.acao}
                      onChange={(e) => setF('acao', e.target.value)}
                      placeholder="O que precisa ser feito..."
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Início *</label>
                      <input style={inputStyle} type="datetime-local" value={form.inicio} onChange={(e) => setF('inicio', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Fim</label>
                      <input style={inputStyle} type="datetime-local" value={form.fim} onChange={(e) => setF('fim', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Prazo</label>
                      <input style={inputStyle} type="date" value={form.prazo} onChange={(e) => setF('prazo', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Prioridade</label>
                    <select style={inputStyle} value={form.prioridade} onChange={(e) => setF('prioridade', e.target.value)}>
                      <option value="Alta">Alta</option>
                      <option value="Media">Média</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline" onPress={modalState.close}>Cancelar</Button>
                <Button variant="primary" onPress={handleSave} isDisabled={!form.titulo || !form.inicio}>Salvar</Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  )
}
