import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  EllipsisHorizontalIcon, PlusIcon, ClockIcon,
  ChatBubbleLeftEllipsisIcon, CheckCircleIcon,
  PencilIcon, TrashIcon, XMarkIcon, CheckIcon,
  MagnifyingGlassIcon, BuildingOffice2Icon,
} from '@heroicons/react/24/outline'
import { empresas, updateEmpresa } from '../data/empresas'
import { getInteracoesByEmpresa } from '../data/interacoes'
import { getContratosByEmpresa } from '../data/contratos'
import { Badge } from '../components/ui/Badge'
import type { PipelineStage, Empresa } from '../types'

// ─── Types ────────────────────────────────────────────────────────────────────
type Coluna = { key: string; label: string; color: string }

const COLOR_PALETTE = [
  '#94A3B8', '#10B981', '#F59E0B', '#3B82F6',
  '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6', '#F97316',
]

const COLUNAS_DEFAULT: Coluna[] = [
  { key: 'sem_tratativa', label: 'Sem tratativa',  color: '#94A3B8' },
  { key: 'renovacao',     label: 'Renovação',       color: '#10B981' },
  { key: 'reajuste',      label: 'Reajuste',        color: '#F59E0B' },
  { key: 'ampliacao',     label: 'Ampliação',       color: '#3B82F6' },
  { key: 'apresentacao',  label: 'Apresentação',    color: '#8B5CF6' },
  { key: 'cancelamento',  label: 'Cancelamento',    color: '#EF4444' },
]

const MAX_COLUNAS = 9

const pipelineMap: Record<PipelineStage, { label: string; variant: 'neutral' | 'brand' | 'pending' | 'active' | 'danger' | 'inactive' }> = {
  prospeccao:        { label: 'Prospecção',       variant: 'neutral'  },
  qualificacao:      { label: 'Qualificação',      variant: 'brand'    },
  proposta_enviada:  { label: 'Proposta Enviada',  variant: 'pending'  },
  em_negociacao:     { label: 'Em Negociação',     variant: 'pending'  },
  proposta_aceita:   { label: 'Proposta Aceita',   variant: 'active'   },
  proposta_recusada: { label: 'Proposta Recusada', variant: 'danger'   },
  fechado:           { label: 'Fechado',           variant: 'inactive' },
}

const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} de ${MESES[d.getMonth()]}.`
}

// ─── Build item helper ────────────────────────────────────────────────────────
function buildItem(empresa: typeof empresas[0], tratativa: string) {
  const interacoes = getInteracoesByEmpresa(empresa.id)
  const contratos  = getContratosByEmpresa(empresa.id)
  const contratoAtivo   = contratos.find((c) => c.status === 'ativo')
  return { empresa, contratoAtivo, tratativa, totalContratos: contratos.length, totalInteracoes: interacoes.length }
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function CarteiraCard({
  item, colColor, onRemove, onView, onDragStart, onDragEnd, isDragging,
}: {
  item: ReturnType<typeof buildItem>
  colColor: string
  onRemove: () => void
  onView: () => void
  onDragStart: () => void
  onDragEnd: () => void
  isDragging: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pipeline = pipelineMap[item.empresa.pipeline]
  const prazoVencido = item.contratoAtivo && new Date(item.contratoAtivo.dataVencimento) < new Date()

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd}
      style={{
        background: 'var(--color-bg-white)',
        borderRadius: 10,
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.20)' : '0 1px 4px rgba(0,0,0,0.10)',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s, opacity 0.15s, transform 0.15s',
        cursor: 'grab',
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)' }}
      onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.10)' }}
      onClick={onView}
    >
      <div style={{ height: 4, background: colColor }} />
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.35 }}>
            {item.empresa.razaoSocial}
          </div>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              aria-label="Opções do card"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, color: 'var(--color-text-muted)', display: 'flex' }}
            >
              <EllipsisHorizontalIcon style={{ width: 16, height: 16 }} />
            </button>
            {menuOpen && (
              <div
                style={{ position: 'absolute', right: 0, top: 22, zIndex: 50, background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', minWidth: 180, padding: 6 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { onRemove(); setMenuOpen(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#EF4444', textAlign: 'left' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <TrashIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
                  Excluir da Carteira
                </button>
              </div>
            )}
          </div>
        </div>

        {item.empresa.nomeFantasia && (
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }}>{item.empresa.nomeFantasia}</div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {item.contratoAtivo && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3, fontSize: 11,
              color: prazoVencido ? '#fff' : 'var(--color-text-muted)',
              background: prazoVencido ? '#EF4444' : 'transparent',
              padding: prazoVencido ? '2px 6px' : 0,
              borderRadius: prazoVencido ? 4 : 0,
            }}>
              <ClockIcon style={{ width: 11, height: 11 }} aria-hidden="true" />
              <span>{formatDate(item.contratoAtivo.dataVencimento)}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--color-text-muted)' }}>
            <ChatBubbleLeftEllipsisIcon style={{ width: 12, height: 12 }} aria-hidden="true" />
            <span>{item.totalInteracoes}</span>
          </div>
          {item.totalContratos > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600,
              background: item.contratoAtivo ? 'var(--color-success)' : 'var(--color-bg-muted)',
              color: item.contratoAtivo ? '#fff' : 'var(--color-text-secondary)',
              padding: '2px 6px', borderRadius: 4,
            }}>
              <CheckCircleIcon style={{ width: 11, height: 11 }} aria-hidden="true" />
              <span>{item.contratoAtivo ? item.totalContratos : 0}/{item.totalContratos}</span>
            </div>
          )}
          <Badge variant={pipeline.variant}>{pipeline.label}</Badge>
        </div>
      </div>
    </div>
  )
}

// ─── Column Header ─────────────────────────────────────────────────────────────
function ColunaHeader({
  col, count, isRenaming, renameValue,
  onRenameStart, onRenameChange, onRenameConfirm, onRenameCancel,
  onDelete, canDelete,
}: {
  col: Coluna
  count: number
  isRenaming: boolean
  renameValue: string
  onRenameStart: () => void
  onRenameChange: (v: string) => void
  onRenameConfirm: () => void
  onRenameCancel: () => void
  onDelete: () => void
  canDelete: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming) inputRef.current?.focus()
  }, [isRenaming])

  return (
    <div style={{ padding: '12px 14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: col.color, flexShrink: 0, display: 'inline-block' }} />

        {isRenaming ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
            <input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onRenameConfirm()
                if (e.key === 'Escape') onRenameCancel()
              }}
              style={{
                fontSize: 13, fontWeight: 700, border: 'none', outline: 'none',
                background: 'rgba(0,0,0,0.06)', borderRadius: 4,
                padding: '2px 6px', width: '100%', color: 'var(--color-text-primary)',
              }}
            />
            <button onClick={onRenameConfirm} aria-label="Confirmar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10B981', display: 'flex', padding: 2 }}>
              <CheckIcon style={{ width: 14, height: 14 }} />
            </button>
            <button onClick={onRenameCancel} aria-label="Cancelar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 2 }}>
              <XMarkIcon style={{ width: 14, height: 14 }} />
            </button>
          </div>
        ) : (
          <>
            <span
              style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', cursor: 'text', userSelect: 'none' }}
              onDoubleClick={onRenameStart}
              title="Clique duas vezes para renomear"
            >
              {col.label}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: 'rgba(0,0,0,0.10)',
              color: 'var(--color-text-secondary)',
              borderRadius: 10, padding: '1px 7px',
            }}>{count}</span>
          </>
        )}
      </div>

      {!isRenaming && (
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            aria-label={`Opções de ${col.label}`}
            onClick={() => setMenuOpen((o) => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)', borderRadius: 6, display: 'flex' }}
          >
            <EllipsisHorizontalIcon style={{ width: 18, height: 18 }} />
          </button>
          {menuOpen && (
            <div
              style={{ position: 'absolute', right: 0, top: 28, zIndex: 50, background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', minWidth: 150, padding: 6 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { setMenuOpen(false); onRenameStart() }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: 'var(--color-text-primary)', textAlign: 'left' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <PencilIcon style={{ width: 14, height: 14, color: 'var(--color-text-muted)' }} />
                Renomear
              </button>
              {canDelete && (
                <>
                  <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete() }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#EF4444', textAlign: 'left' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <TrashIcon style={{ width: 14, height: 14 }} />
                    Excluir coluna
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
// ─── Modal Seletor de Empresa ─────────────────────────────────────────────────
function SeletorEmpresa({
  colLabel,
  colColor,
  jaNaCarteira,
  onSelect,
  onClose,
}: {
  colLabel: string
  colColor: string
  jaNaCarteira: Set<number>
  onSelect: (empresa: Empresa) => void
  onClose: () => void
}) {
  const [busca, setBusca] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const disponiveis = useMemo(() => {
    const q = busca.toLowerCase().trim()
    return empresas.filter((e) => {
      if (jaNaCarteira.has(e.id)) return false
      if (!q) return true
      return (
        e.razaoSocial.toLowerCase().includes(q) ||
        e.nomeFantasia?.toLowerCase().includes(q) ||
        e.cnpj.includes(q)
      )
    })
  }, [busca, jaNaCarteira])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-bg-white)',
          borderRadius: 16,
          width: 480,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: colColor, display: 'inline-block' }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Adicionar à <span style={{ color: colColor }}>{colLabel}</span>
              </span>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 4, borderRadius: 6 }}
            >
              <XMarkIcon style={{ width: 18, height: 18 }} />
            </button>
          </div>
          {/* Busca */}
          <div style={{ position: 'relative' }}>
            <MagnifyingGlassIcon style={{ width: 16, height: 16, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              ref={inputRef}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou CNPJ..."
              style={{
                width: '100%', padding: '8px 12px 8px 34px',
                border: '1px solid var(--color-border)',
                borderRadius: 8, fontSize: 14,
                background: 'var(--color-bg-muted)',
                color: 'var(--color-text-primary)',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Lista */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {disponiveis.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
              {busca ? 'Nenhuma empresa encontrada' : 'Todas as empresas já estão na carteira'}
            </div>
          ) : (
            disponiveis.map((emp) => (
              <button
                key={emp.id}
                onClick={() => onSelect(emp)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '12px 20px',
                  background: 'none', border: 'none',
                  borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: 'var(--color-bg-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BuildingOffice2Icon style={{ width: 18, height: 18, color: 'var(--color-text-muted)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {emp.razaoSocial}
                  </div>
                  {emp.nomeFantasia && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{emp.nomeFantasia}</div>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0 }}>{emp.cnpj}</div>
              </button>
            ))
          )}
        </div>

        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-muted)' }}>
          {disponiveis.length} empresa{disponiveis.length !== 1 ? 's' : ''} disponível{disponiveis.length !== 1 ? 'is' : ''}
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Carteira() {
  const navigate = useNavigate()
  const [colunas, setColunas] = useState<Coluna[]>(COLUNAS_DEFAULT)
  const [tratativas, setTratativas] = useState<Record<number, string>>({})
  const [data, setData] = useState(() => empresas.filter((e) => e.favorita))
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const [renamingKey, setRenamingKey] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [seletorColKey, setSeletorColKey] = useState<string | null>(null)
  const dragCounter = useRef<Record<string, number>>({})

  const todasEmpresas = useMemo(() =>
    data.map((e) => buildItem(e, tratativas[e.id] ?? colunas[0].key)),
    [data, tratativas, colunas]
  )

  const moveTo = (empresaId: number, key: string) =>
    setTratativas((prev) => ({ ...prev, [empresaId]: key }))

  // ── Drag ──
  const handleDrop = (colKey: string) => {
    if (draggedId !== null) moveTo(draggedId, colKey)
    setDraggedId(null)
    setDragOverCol(null)
    dragCounter.current = {}
  }
  const handleDragEnter = (colKey: string, e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current[colKey] = (dragCounter.current[colKey] || 0) + 1
    setDragOverCol(colKey)
  }
  const handleDragLeave = (colKey: string) => {
    dragCounter.current[colKey] = Math.max(0, (dragCounter.current[colKey] || 1) - 1)
    if (dragCounter.current[colKey] === 0) setDragOverCol((p) => (p === colKey ? null : p))
  }

  // ── Rename ──
  const startRename = (col: Coluna) => { setRenamingKey(col.key); setRenameValue(col.label) }
  const confirmRename = () => {
    if (renamingKey && renameValue.trim()) {
      setColunas((cols) => cols.map((c) => c.key === renamingKey ? { ...c, label: renameValue.trim() } : c))
    }
    setRenamingKey(null)
  }
  const cancelRename = () => setRenamingKey(null)

  // ── Delete ──
  const deleteColuna = (key: string) => {
    const fallback = colunas.find((c) => c.key !== key)?.key ?? ''
    setTratativas((prev) => {
      const next = { ...prev }
      Object.entries(next).forEach(([id, t]) => { if (t === key) next[Number(id)] = fallback })
      return next
    })
    setColunas((cols) => cols.filter((c) => c.key !== key))
  }

  // ── Seletor ──
  const jaNaCarteira = useMemo(() => new Set(data.map((e) => e.id)), [data])

  const abrirSeletor = (colKey: string) => setSeletorColKey(colKey)

  const adicionarEmpresa = (empresa: Empresa) => {
    updateEmpresa(empresa.id, { favorita: true })
    setTratativas((prev) => ({ ...prev, [empresa.id]: seletorColKey ?? colunas[0].key }))
    setData((prev) => [...prev, { ...empresa, favorita: true }])
    setSeletorColKey(null)
  }

  // ── Add coluna ──
  const addColuna = () => {
    if (colunas.length >= MAX_COLUNAS) return
    const usedColors = colunas.map((c) => c.color)
    const nextColor = COLOR_PALETTE.find((c) => !usedColors.includes(c)) ?? COLOR_PALETTE[colunas.length % COLOR_PALETTE.length]
    const newKey = `coluna_${Date.now()}`
    const newCol: Coluna = { key: newKey, label: 'Nova coluna', color: nextColor }
    setColunas((cols) => [...cols, newCol])
    setTimeout(() => { setRenamingKey(newKey); setRenameValue('Nova coluna') }, 50)
  }

  const totalNaCarteira = todasEmpresas.length

  if (totalNaCarteira === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--color-text-muted)' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>Nenhuma empresa na carteira</p>
        <p style={{ fontSize: 14 }}>Favorite empresas na tela de Cadastro para acompanhá-las aqui.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Minha Carteira</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
          {totalNaCarteira} empresa{totalNaCarteira !== 1 ? 's' : ''} • arraste para mover • clique duas vezes no título da coluna para renomear
        </p>
      </div>

      {/* Kanban board */}
      <div style={{ display: 'flex', gap: 12, flex: 1, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
        {colunas.map((col) => {
          const items = todasEmpresas.filter((i) => i.tratativa === col.key)
          const isOver = dragOverCol === col.key && draggedId !== null
          const isRenaming = renamingKey === col.key

          return (
            <div
              key={col.key}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
              onDragEnter={(e) => handleDragEnter(col.key, e)}
              onDragLeave={() => handleDragLeave(col.key)}
              onDrop={() => handleDrop(col.key)}
              style={{
                flexShrink: 0, width: 260,
                background: isOver ? `${col.color}18` : 'rgba(0,0,0,0.05)',
                borderRadius: 14, overflow: 'hidden',
                border: `2px solid ${isOver ? col.color : 'transparent'}`,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              <ColunaHeader
                col={col}
                count={items.length}
                isRenaming={isRenaming}
                renameValue={renameValue}
                onRenameStart={() => startRename(col)}
                onRenameChange={setRenameValue}
                onRenameConfirm={confirmRename}
                onRenameCancel={cancelRename}
                onDelete={() => deleteColuna(col.key)}
                canDelete={colunas.length > 1}
              />

              {/* Cards */}
              <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 60 }}>
                {items.map((item) => (
                  <CarteiraCard
                    key={item.empresa.id}
                    item={item}
                    colColor={col.color}
                    onRemove={() => { updateEmpresa(item.empresa.id, { favorita: false }); setData((prev) => prev.filter((e) => e.id !== item.empresa.id)) }}
                    onView={() => { if (draggedId === null) navigate(`/cadastro/empresa/${item.empresa.id}`) }}
                    onDragStart={() => setDraggedId(item.empresa.id)}
                    onDragEnd={() => { setDraggedId(null); setDragOverCol(null); dragCounter.current = {} }}
                    isDragging={draggedId === item.empresa.id}
                  />
                ))}
                {isOver && items.length === 0 && (
                  <div style={{
                    height: 60, border: `2px dashed ${col.color}`, borderRadius: 8,
                    background: `${col.color}10`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 12, color: col.color, fontWeight: 600,
                  }}>
                    Soltar aqui
                  </div>
                )}
              </div>

              {/* Add card */}
              <button
                aria-label={`Adicionar empresa em ${col.label}`}
                onClick={() => abrirSeletor(col.key)}
                style={{
                  margin: '8px', padding: '8px 12px', background: 'transparent',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                  color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center',
                  gap: 6, width: 'calc(100% - 16px)', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.07)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <PlusIcon style={{ width: 14, height: 14 }} aria-hidden="true" />
                Adicionar um cartão
              </button>
            </div>
          )
        })}

        {/* Add column */}
        {colunas.length < MAX_COLUNAS && (
          <button
            onClick={addColuna}
            title={`${colunas.length}/${MAX_COLUNAS} colunas`}
            style={{
              flexShrink: 0, width: 240, height: 52,
              background: 'rgba(0,0,0,0.04)',
              border: '2px dashed rgba(0,0,0,0.13)',
              borderRadius: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, fontSize: 13, fontWeight: 600,
              color: 'var(--color-text-muted)',
              transition: 'background 0.15s, border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.08)'
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.13)'
              e.currentTarget.style.color = 'var(--color-text-muted)'
            }}
          >
            <PlusIcon style={{ width: 16, height: 16 }} />
            Adicionar coluna
            <span style={{ fontSize: 11, opacity: 0.6 }}>({colunas.length}/{MAX_COLUNAS})</span>
          </button>
        )}
      </div>

      {/* Modal seletor */}
      {seletorColKey && (() => {
        const col = colunas.find((c) => c.key === seletorColKey)!
        return (
          <SeletorEmpresa
            colLabel={col.label}
            colColor={col.color}
            jaNaCarteira={jaNaCarteira}
            onSelect={adicionarEmpresa}
            onClose={() => setSeletorColKey(null)}
          />
        )
      })()}
    </div>
  )
}
