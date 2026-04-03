import { useState, useMemo } from 'react'
import { Button, Modal, useOverlayState } from '@heroui/react'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, ClockIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { atividades as atividadesData, addAtividade } from '../data/atividades'
import type { Prioridade, Atividade } from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const DIAS_FULL   = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const MESES       = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay() + 1)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} de ${MESES[d.getMonth()]}.`
}

// ─── Priority stripe color ────────────────────────────────────────────────────
const prioColor: Record<Prioridade, string> = {
  Alta:  '#EF4444',
  Media: '#F59E0B',
  Baixa: '#10B981',
}

// ─── Form defaults ────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  titulo: '',
  acao: '',
  prioridade: 'Media' as Prioridade,
  inicio: '',
  fim: '',
  prazo: '',
}

// ─── Trello Card ──────────────────────────────────────────────────────────────
function TrelloCard({
  atividade,
  isDone,
  onToggleDone,
}: {
  atividade: Atividade
  isDone: boolean
  onToggleDone: () => void
}) {
  const etapasTotal     = atividade.etapas?.length ?? 0
  const isPrazoVencido  = !isDone && new Date(atividade.prazo) < new Date() && !isSameDay(new Date(atividade.prazo), new Date())

  return (
    <div
      style={{
        background: 'var(--color-bg-white)',
        borderRadius: 10,
        boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
        overflow: 'hidden',
        opacity: isDone ? 0.55 : 1,
        transition: 'box-shadow 0.15s, opacity 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.15)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.10)')}
    >
      {/* Colored stripe (priority) */}
      <div style={{ height: 4, background: prioColor[atividade.prioridade] }} />

      <div style={{ padding: '10px 12px 10px' }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 8 }}>
          {/* Circle toggle */}
          <button
            aria-label={isDone ? 'Marcar como pendente' : 'Marcar como concluída'}
            onClick={(e) => { e.stopPropagation(); onToggleDone() }}
            style={{
              flexShrink: 0,
              marginTop: 2,
              width: 16, height: 16, borderRadius: '50%',
              border: `2px solid ${isDone ? 'var(--color-success)' : 'var(--color-border)'}`,
              background: isDone ? 'var(--color-success)' : 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isDone && <span style={{ color: '#fff', fontSize: 9, lineHeight: 1 }}>✓</span>}
          </button>

          <span style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            lineHeight: 1.35,
            textDecoration: isDone ? 'line-through' : 'none',
          }}>
            {atividade.titulo}
          </span>

          {/* Edit icon placeholder */}
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 1 }}>✎</span>
        </div>

        {/* Footer: prazo + descrição count + etapas badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Prazo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 11,
            color: isPrazoVencido ? '#fff' : 'var(--color-text-muted)',
            background: isPrazoVencido ? '#EF4444' : 'transparent',
            padding: isPrazoVencido ? '2px 6px' : '0',
            borderRadius: isPrazoVencido ? 4 : 0,
          }}>
            <ClockIcon style={{ width: 11, height: 11 }} aria-hidden="true" />
            <span>{formatDate(atividade.prazo)}</span>
          </div>

          {/* Descrição count (≡) */}
          {atividade.acao && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--color-text-muted)' }}>
              <span>≡</span>
            </div>
          )}

          {/* Etapas checklist badge */}
          {etapasTotal > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3,
              fontSize: 11, fontWeight: 600,
              background: isDone ? 'var(--color-success)' : 'var(--color-bg-muted)',
              color: isDone ? '#fff' : 'var(--color-text-secondary)',
              padding: '2px 6px',
              borderRadius: 4,
            }}>
              <span>☑</span>
              <span>{isDone ? etapasTotal : 0}/{etapasTotal}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Trello Column ────────────────────────────────────────────────────────────
function TrelloColumn({
  day,
  items,
  done,
  onToggleDone,
  onAddCard,
  today,
}: {
  day: Date
  items: Atividade[]
  done: Set<number>
  onToggleDone: (id: number) => void
  onAddCard: (day: Date) => void
  today: Date
}) {
  const isToday  = isSameDay(day, today)
  const isPast   = day < today && !isToday
  const dayDone  = items.filter((a) => done.has(a.id)).length
  const dayTotal = items.length

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minWidth: 220,
      maxWidth: 260,
      background: 'rgba(0,0,0,0.06)',
      borderRadius: 14,
      overflow: 'hidden',
      border: isToday ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
      flexShrink: 0,
    }}>
      {/* Column Header */}
      <div style={{
        padding: '12px 14px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
          }}>
            <span style={{
              fontSize: 15,
              fontWeight: 700,
              color: isToday ? 'var(--color-brand-primary)' : isPast ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            }}>
              {DIAS_SEMANA[day.getDay()]}
            </span>
            <span style={{
              fontSize: 13,
              color: isToday ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
            }}>
              {day.getDate()} de {MESES[day.getMonth()]}
            </span>
          </div>

          {/* Progress bar */}
          {dayTotal > 0 && (
            <div style={{ marginTop: 6 }}>
              <div style={{ height: 3, background: 'rgba(0,0,0,0.12)', borderRadius: 2, overflow: 'hidden', width: 100 }}>
                <div style={{
                  height: '100%',
                  width: `${(dayDone / dayTotal) * 100}%`,
                  background: dayDone === dayTotal ? 'var(--color-success)' : 'var(--color-brand-primary)',
                  borderRadius: 2,
                  transition: 'width 0.3s',
                }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
                {dayDone}/{dayTotal} concluídas
              </div>
            </div>
          )}
        </div>

        <button
          aria-label="Opções da coluna"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)', borderRadius: 6 }}
        >
          <EllipsisHorizontalIcon style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* Cards area */}
      <div style={{
        flex: 1,
        padding: '0 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 260px)',
      }}>
        {items.map((ativ) => (
          <TrelloCard
            key={ativ.id}
            atividade={ativ}
            isDone={done.has(ativ.id)}
            onToggleDone={() => onToggleDone(ativ.id)}
          />
        ))}
      </div>

      {/* Add card button */}
      <button
        aria-label={`Adicionar cartão em ${DIAS_FULL[day.getDay()]}`}
        onClick={() => onAddCard(day)}
        style={{
          margin: '8px',
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 13,
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'background 0.15s',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.07)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <PlusIcon style={{ width: 14, height: 14 }} aria-hidden="true" />
        Adicionar um cartão
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Agenda() {
  const [weekStart, setWeekStart]       = useState(() => startOfWeek(new Date()))
  const [localAtividades, setLocalAtividades] = useState(atividadesData)
  const [done, setDone]                 = useState<Set<number>>(new Set())
  const [filterPrio, setFilterPrio]     = useState<string>('')
  const [form, setForm]                 = useState(EMPTY_FORM)
  const modalState                      = useOverlayState()
  const today                           = new Date()

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const byDay = useMemo(() =>
    weekDays.map((day) => ({
      day,
      items: localAtividades
        .filter((a) => {
          const match = isSameDay(new Date(a.inicio), day)
          const prioMatch = !filterPrio || a.prioridade === filterPrio
          return match && prioMatch
        })
        .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()),
    })),
    [weekDays, localAtividades, filterPrio]
  )

  const isCurrentWeek = isSameDay(weekStart, startOfWeek(today))
  const prevWeek      = () => setWeekStart((d) => addDays(d, -7))
  const nextWeek      = () => setWeekStart((d) => addDays(d, 7))
  const goToday       = () => setWeekStart(startOfWeek(today))

  const toggleDone = (id: number) => {
    setDone((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const openNew = (day?: Date) => {
    const dateStr = (day ?? today).toISOString().slice(0, 10)
    setForm({ ...EMPTY_FORM, inicio: `${dateStr}T09:00`, fim: `${dateStr}T10:00`, prazo: dateStr })
    modalState.open()
  }

  const handleSave = () => {
    if (!form.titulo.trim()) return
    const nova: Atividade = {
      id: Date.now(),
      usuarioId: 3,
      titulo: form.titulo,
      acao: form.acao,
      etapas: [],
      prioridade: form.prioridade,
      inicio: form.inicio || `${form.prazo}T09:00:00`,
      fim:    form.fim    || `${form.prazo}T10:00:00`,
      prazo:  form.prazo,
    }
    addAtividade(nova)
    setLocalAtividades([...atividadesData])
    modalState.close()
  }

  const setF = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const S: React.CSSProperties = {
    width: '100%', padding: '8px 12px', fontSize: 14,
    border: '1px solid var(--color-border)', borderRadius: 8,
    background: 'var(--color-bg-white)', color: 'var(--color-text-primary)',
    boxSizing: 'border-box',
  }

  const totalSemana     = byDay.reduce((acc, d) => acc + d.items.length, 0)
  const totalConcluidas = byDay.reduce((acc, d) => acc + d.items.filter((a) => done.has(a.id)).length, 0)
  const totalAlta       = byDay.reduce((acc, d) => acc + d.items.filter((a) => a.prioridade === 'Alta').length, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Agenda</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            {weekDays[0].getDate()} de {MESES[weekDays[0].getMonth()]} — {weekDays[6].getDate()} de {MESES[weekDays[6].getMonth()]}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Stats pills */}
          {([
            { label: `${totalSemana} cartões`, color: 'var(--color-text-secondary)' },
            { label: `${totalConcluidas} concluídos`, color: 'var(--color-success)' },
            totalAlta > 0 ? { label: `${totalAlta} alta prioridade`, color: 'var(--color-danger)' } : null,
          ] as ({ label: string; color: string } | null)[]).filter(Boolean).map((s, i) => (
            <span key={i} style={{ fontSize: 12, fontWeight: 500, color: s!.color, padding: '4px 10px', background: 'var(--color-bg-muted)', borderRadius: 20, border: '1px solid var(--color-border)' }}>
              {s!.label}
            </span>
          ))}

          {/* Priority filter */}
          <select
            aria-label="Filtrar por prioridade"
            value={filterPrio}
            onChange={(e) => setFilterPrio(e.target.value)}
            style={{ ...S, width: 'auto', fontSize: 13, padding: '6px 10px' }}
          >
            <option value="">Todas as prioridades</option>
            <option value="Alta">🔴 Alta</option>
            <option value="Media">🟡 Média</option>
            <option value="Baixa">🟢 Baixa</option>
          </select>

          {/* Week navigation */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button aria-label="Semana anterior" onClick={prevWeek} style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
              <ChevronLeftIcon style={{ width: 16, height: 16 }} />
            </button>
            {!isCurrentWeek && (
              <button onClick={goToday} style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: 'var(--color-brand-primary)', fontWeight: 600 }}>
                Hoje
              </button>
            )}
            <button aria-label="Próxima semana" onClick={nextWeek} style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
              <ChevronRightIcon style={{ width: 16, height: 16 }} />
            </button>
          </div>

          <Button variant="primary" onPress={() => openNew()}>
            <PlusIcon style={{ width: 16, height: 16 }} aria-hidden="true" />
            Novo cartão
          </Button>
        </div>
      </div>

      {/* ── Kanban Board ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: 12,
        flex: 1,
        minHeight: 0,
        overflowX: 'auto',
        paddingBottom: 12,
      }}>
        {byDay.map(({ day, items }) => (
          <TrelloColumn
            key={day.toISOString()}
            day={day}
            items={items}
            done={done}
            onToggleDone={toggleDone}
            onAddCard={openNew}
            today={today}
          />
        ))}
      </div>

      {/* ── Modal Nova Atividade ────────────────────────────────────────────── */}
      <Modal isOpen={modalState.isOpen} onOpenChange={modalState.setOpen}>
        <Modal.Backdrop isDismissable={false}>
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.Header style={{ padding: '20px 24px 16px' }}>
                <Modal.Heading style={{ fontSize: 17, fontWeight: 700 }}>Novo cartão</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>

              <Modal.Body style={{ padding: '0 24px 8px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label htmlFor="atv-titulo" style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'flex', gap: 3 }}>
                    Título <span aria-hidden="true" style={{ color: 'var(--color-danger)' }}>*</span>
                    <span className="sr-only">(obrigatório)</span>
                  </label>
                  <input id="atv-titulo" aria-required="true" className="yeb-input" style={S} placeholder="Ex: Reunião com Agromax" value={form.titulo} onChange={(e) => setF('titulo', e.target.value)} autoFocus />
                </div>

                <div>
                  <label htmlFor="atv-acao" style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block' }}>Descrição</label>
                  <textarea id="atv-acao" className="yeb-input" style={{ ...S, resize: 'vertical', minHeight: 72 }} placeholder="O que precisa ser feito?" value={form.acao} onChange={(e) => setF('acao', e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label htmlFor="atv-inicio" style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block' }}>Início</label>
                    <input id="atv-inicio" type="datetime-local" className="yeb-input" style={S} value={form.inicio} onChange={(e) => setF('inicio', e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="atv-fim" style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block' }}>Fim</label>
                    <input id="atv-fim" type="datetime-local" className="yeb-input" style={S} value={form.fim} onChange={(e) => setF('fim', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label htmlFor="atv-prioridade" style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block' }}>Prioridade</label>
                  <select id="atv-prioridade" className="yeb-input" style={S} value={form.prioridade} onChange={(e) => setF('prioridade', e.target.value)}>
                    <option value="Alta">🔴 Alta</option>
                    <option value="Media">🟡 Média</option>
                    <option value="Baixa">🟢 Baixa</option>
                  </select>
                </div>
              </Modal.Body>

              <Modal.Footer style={{ padding: '14px 24px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Button variant="ghost" onPress={modalState.close}>Cancelar</Button>
                <Button variant="primary" onPress={handleSave} isDisabled={!form.titulo.trim()}>
                  Adicionar cartão
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  )
}
