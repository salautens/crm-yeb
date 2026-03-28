import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Modal, Dropdown, useOverlayState } from '@heroui/react'
import { empresas as initialEmpresas, addEmpresa, updateEmpresa, deleteEmpresa } from '../../data/empresas'
import { segmentos } from '../../data/segmentos'
import { usuarios } from '../../data/usuarios'
import { useViaCep } from '../../hooks/useViaCep'
import { usePagination } from '../../hooks/usePagination'
import { PageHeader, TablePagination, ConfirmDialog, EmpresaAlvoBadge } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import type { Empresa, PipelineStage } from '../../types'

// ─── Maps ──────────────────────────────────────────────────────────────────────
const pipelineMap: Record<PipelineStage, { label: string; variant: 'neutral' | 'brand' | 'pending' | 'active' }> = {
  prospeccao:  { label: 'Prospecção',  variant: 'neutral'  },
  qualificacao: { label: 'Qualificação', variant: 'brand'  },
  proposta:    { label: 'Proposta',    variant: 'pending'  },
  negociacao:  { label: 'Negociação',  variant: 'pending'  },
  fechado:     { label: 'Fechado',     variant: 'active'   },
}

// ─── Masks ─────────────────────────────────────────────────────────────────────
function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0,2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}
function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (!d.length) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}
function formatCEP(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0,5)}-${d.slice(5)}` : d
}

// ─── Form ─────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  tipo: 'matriz' as 'matriz' | 'filial',
  cnpj: '', cnpjMatriz: '',
  razaoSocial: '', nomeFantasia: '',
  telefone: '', email: '',
  pais: 'Brasil', cep: '',
  logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
  segmentoId: 1,
  pipeline: 'prospeccao' as PipelineStage,
  empresaAlvo: false,
  usuarioId: 1,
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const S: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: 14,
  border: '1px solid var(--color-border)', borderRadius: 8,
  background: 'var(--color-bg-white)', color: 'var(--color-text-primary)',
  boxSizing: 'border-box',
}

// ─── Reusable Field wrapper ────────────────────────────────────────────────────
function Field({ label, required, children, style }: { label: string; required?: boolean; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'flex', gap: 3 }}>
        {label}{required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
      </div>
      {children}
    </div>
  )
}

// ─── Step indicator ────────────────────────────────────────────────────────────
const STEPS = ['Identificação', 'Endereço', 'Dados Comerciais']

function StepBar({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 28, padding: '0 4px' }}>
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700,
              background: i < current ? 'var(--color-brand-primary)' : i === current ? 'var(--color-brand-primary)' : 'var(--color-bg-muted)',
              color: i <= current ? '#fff' : 'var(--color-text-muted)',
              boxShadow: i === current ? '0 0 0 4px rgba(29,78,216,0.15)' : 'none',
              transition: 'all 0.25s',
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <div style={{ fontSize: 11, fontWeight: i === current ? 600 : 400, color: i === current ? 'var(--color-brand-primary)' : i < current ? 'var(--color-text-secondary)' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              {label}
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, margin: '0 10px', marginBottom: 22, background: i < current ? 'var(--color-brand-primary)' : 'var(--color-border)', transition: 'background 0.3s', borderRadius: 1 }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '10px 14px', border: `1.5px solid ${checked ? 'var(--color-brand-primary)' : 'var(--color-border)'}`, borderRadius: 10, background: checked ? 'rgba(29,78,216,0.04)' : 'var(--color-bg-white)', transition: 'all 0.2s' }}>
      <div style={{ width: 40, height: 22, borderRadius: 11, background: checked ? 'var(--color-brand-primary)' : '#CBD5E1', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: checked ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: checked ? 'var(--color-brand-primary)' : 'var(--color-text-primary)' }}>Empresa Alvo</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{checked ? 'Marcada como alvo estratégico' : 'Clique para marcar como alvo'}</div>
      </div>
    </div>
  )
}

// ─── Summary card (step 3) ─────────────────────────────────────────────────────
function SummaryCard({ form }: { form: typeof EMPTY_FORM }) {
  const seg = segmentos.find((s) => s.id === form.segmentoId)
  return (
    <div style={{ background: 'var(--color-bg-muted)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, height: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Resumo do Cadastro</div>

      {/* Company identity */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>{form.razaoSocial || '—'}</div>
        {form.nomeFantasia && <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{form.nomeFantasia}</div>}
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>{form.cnpj || '—'}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { icon: '🏷️', label: form.tipo === 'matriz' ? 'Matriz' : 'Filial' },
          form.telefone ? { icon: '📞', label: form.telefone } : null,
          form.email ? { icon: '✉️', label: form.email } : null,
          (form.cidade || form.uf) ? { icon: '📍', label: [form.logradouro, form.numero, form.cidade && form.uf ? `${form.cidade} — ${form.uf}` : form.cidade || form.uf].filter(Boolean).join(', ') } : null,
          seg ? { icon: '🌿', label: seg.nome } : null,
        ].filter(Boolean).map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--color-text-secondary)', alignItems: 'flex-start' }}>
            <span>{item!.icon}</span>
            <span style={{ lineHeight: 1.4 }}>{item!.label}</span>
          </div>
        ))}
        {form.empresaAlvo && (
          <div style={{ display: 'inline-flex', marginTop: 4 }}>
            <Badge variant="brand">Empresa Alvo</Badge>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EmpresaList() {
  const navigate = useNavigate()
  const [data, setData] = useState(initialEmpresas)
  const [search, setSearch] = useState('')
  const [filterSegmento, setFilterSegmento] = useState('')
  const [filterAlvo, setFilterAlvo] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [step, setStep] = useState(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [toDelete, setToDelete] = useState<Empresa | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)

  const modalState = useOverlayState()
  const deleteState = useOverlayState()

  const [cepTouched, setCepTouched] = useState(false)
  const cepResult = useViaCep(cepTouched ? form.cep : '')

  useEffect(() => {
    if (cepResult.data && cepTouched) {
      setForm((f) => ({ ...f, logradouro: cepResult.data!.logradouro, bairro: cepResult.data!.bairro, cidade: cepResult.data!.localidade, uf: cepResult.data!.uf }))
      setAutoFilled(true)
    }
  }, [cepResult.data, cepTouched])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data.filter((e) => {
      const matchSearch = !q || e.razaoSocial.toLowerCase().includes(q) || e.nomeFantasia.toLowerCase().includes(q) || e.cnpj.includes(q)
      return matchSearch && (!filterSegmento || e.segmentoId === Number(filterSegmento)) && (filterAlvo === '' ? true : filterAlvo === 'sim' ? e.empresaAlvo : !e.empresaAlvo)
    })
  }, [data, search, filterSegmento, filterAlvo])

  const { page, setPage, totalPages, paginated } = usePagination(filtered, 10)

  const openNew = () => {
    setEditingId(null); setForm(EMPTY_FORM); setStep(0)
    setCepTouched(false); setAutoFilled(false); modalState.open()
  }

  const openEdit = (empresa: Empresa) => {
    setEditingId(empresa.id); setStep(0)
    setForm({ tipo: empresa.tipo, cnpj: empresa.cnpj, cnpjMatriz: empresa.cnpjMatriz ?? '', razaoSocial: empresa.razaoSocial, nomeFantasia: empresa.nomeFantasia, telefone: empresa.telefone ?? '', email: empresa.email ?? '', pais: empresa.pais, cep: empresa.cep ?? '', logradouro: empresa.logradouro ?? '', numero: '', complemento: '', bairro: empresa.bairro ?? '', cidade: empresa.cidade ?? '', uf: empresa.uf ?? '', segmentoId: empresa.segmentoId, pipeline: empresa.pipeline, empresaAlvo: empresa.empresaAlvo, usuarioId: empresa.usuarioId })
    setCepTouched(false); setAutoFilled(false); modalState.open()
  }

  const handleSave = () => {
    const logradouroFull = [form.logradouro, form.numero].filter(Boolean).join(', ')
    const payload = { tipo: form.tipo, cnpj: form.cnpj, cnpjMatriz: form.tipo === 'filial' ? form.cnpjMatriz : undefined, razaoSocial: form.razaoSocial, nomeFantasia: form.nomeFantasia, telefone: form.telefone || undefined, email: form.email || undefined, pais: form.pais, cep: form.cep || undefined, logradouro: logradouroFull || undefined, bairro: form.bairro || undefined, cidade: form.cidade || undefined, uf: form.uf || undefined, segmentoId: form.segmentoId, pipeline: form.pipeline, empresaAlvo: form.empresaAlvo, usuarioId: form.usuarioId }
    if (editingId !== null) {
      updateEmpresa(editingId, payload)
    } else {
      addEmpresa({ id: Date.now(), ...payload, favorita: false, createdAt: new Date().toISOString().split('T')[0] } as Empresa)
    }
    setData([...initialEmpresas]); modalState.close()
  }

  const handleToggleAlvo = (empresa: Empresa) => { updateEmpresa(empresa.id, { empresaAlvo: !empresa.empresaAlvo }); setData([...initialEmpresas]) }
  const handleDelete = () => {
    if (!toDelete) return; setDeleting(true)
    setTimeout(() => { deleteEmpresa(toDelete.id); setData([...initialEmpresas]); setDeleting(false); deleteState.close(); setToDelete(null) }, 400)
  }

  const setF = (field: string, value: unknown) => {
    if (['logradouro', 'bairro', 'cidade', 'uf'].includes(field)) setAutoFilled(false)
    setForm((f) => ({ ...f, [field]: value }))
  }

  const isEditing = editingId !== null
  const canNext0 = !!form.razaoSocial && form.cnpj.replace(/\D/g, '').length === 14
  const canSave = canNext0

  return (
    <div>
      <PageHeader
        title="Empresas"
        subtitle={`${data.length} empresas cadastradas`}
        actions={<Button variant="primary" onPress={openNew}>+ Cadastrar Empresa</Button>}
      />

      {/* Toolbar */}
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <input className="yeb-input" style={{ ...S, maxWidth: 280, padding: '7px 10px', fontSize: 13 }} placeholder="Buscar por nome ou CNPJ..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        <select className="yeb-input" style={{ ...S, maxWidth: 180, padding: '7px 10px', fontSize: 13 }} value={filterSegmento} onChange={(e) => { setFilterSegmento(e.target.value); setPage(1) }}>
          <option value="">Todos os segmentos</option>
          {segmentos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
        <select className="yeb-input" style={{ ...S, maxWidth: 160, padding: '7px 10px', fontSize: 13 }} value={filterAlvo} onChange={(e) => { setFilterAlvo(e.target.value); setPage(1) }}>
          <option value="">Empresa Alvo: Todos</option>
          <option value="sim">Alvo: Sim</option>
          <option value="nao">Alvo: Não</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['CNPJ', 'Empresa', 'Segmento', 'Tipo', 'Pipeline', 'Alvo', ''].map((h) => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>Nenhuma empresa encontrada</td></tr>
            ) : (
              paginated.map((empresa) => {
                const segmento = segmentos.find((s) => s.id === empresa.segmentoId)
                const pipeline = pipelineMap[empresa.pipeline]
                return (
                  <tr key={empresa.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-muted)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{empresa.cnpj}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{empresa.razaoSocial}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{empresa.nomeFantasia}</div>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{segmento?.nome ?? '—'}</td>
                    <td style={{ padding: '11px 16px' }}><Badge variant="neutral">{empresa.tipo === 'matriz' ? 'Matriz' : 'Filial'}</Badge></td>
                    <td style={{ padding: '11px 16px' }}><Badge variant={pipeline.variant}>{pipeline.label}</Badge></td>
                    <td style={{ padding: '11px 16px' }}><EmpresaAlvoBadge isAlvo={empresa.empresaAlvo} /></td>
                    <td style={{ padding: '11px 16px' }}>
                      <Dropdown>
                        <Dropdown.Trigger>
                          <Button variant="ghost" style={{ padding: '4px 10px', fontSize: 18, lineHeight: 1 }}>⋯</Button>
                        </Dropdown.Trigger>
                        <Dropdown.Popover>
                          <Dropdown.Menu>
                            <Dropdown.Item onPress={() => navigate(`/cadastro/empresa/${empresa.id}`)}>Ver Detalhes</Dropdown.Item>
                            <Dropdown.Item onPress={() => openEdit(empresa)}>Editar</Dropdown.Item>
                            <Dropdown.Item onPress={() => handleToggleAlvo(empresa)}>{empresa.empresaAlvo ? 'Remover como Alvo' : 'Tornar Empresa Alvo'}</Dropdown.Item>
                            <Dropdown.Item onPress={() => { setToDelete(empresa); deleteState.open() }} style={{ color: 'var(--color-danger)' }}>Excluir</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown.Popover>
                      </Dropdown>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* ── Wizard Modal ──────────────────────────────────────────────────────── */}
      <Modal isOpen={modalState.isOpen} onOpenChange={modalState.setOpen}>
        <Modal.Backdrop isDismissable={false}>
          <Modal.Container size="lg" className="empresa-modal-container">
            <Modal.Dialog>

              {/* Header */}
              <Modal.Header style={{ padding: '20px 28px 16px' }}>
                <div>
                  <Modal.Heading style={{ fontSize: 18, fontWeight: 700 }}>
                    {isEditing ? 'Editar Empresa' : 'Cadastrar Empresa'}
                  </Modal.Heading>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    Etapa {step + 1} de {STEPS.length} — {STEPS[step]}
                  </div>
                </div>
                <Modal.CloseTrigger />
              </Modal.Header>

              {/* Body */}
              <Modal.Body style={{ padding: '0 28px 8px' }}>
                {/* Step indicator */}
                <StepBar current={step} />

                {/* ── Step 0: Identificação ──────────────────────────────── */}
                {step === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 14 }}>
                      <Field label="Tipo" required>
                        <select className="yeb-input" style={S} value={form.tipo} onChange={(e) => setF('tipo', e.target.value)} autoFocus>
                          <option value="matriz">Matriz</option>
                          <option value="filial">Filial</option>
                        </select>
                      </Field>
                      <Field label="CNPJ" required>
                        <input className="yeb-input" style={S} placeholder="00.000.000/0000-00" value={form.cnpj} onChange={(e) => setF('cnpj', formatCNPJ(e.target.value))} />
                      </Field>
                    </div>

                    {form.tipo === 'filial' && (
                      <Field label="CNPJ da Matriz" required>
                        <input className="yeb-input" style={S} placeholder="00.000.000/0000-00" value={form.cnpjMatriz} onChange={(e) => setF('cnpjMatriz', formatCNPJ(e.target.value))} />
                      </Field>
                    )}

                    <Field label="Razão Social" required>
                      <input className="yeb-input" style={S} placeholder="Nome jurídico completo da empresa" value={form.razaoSocial} onChange={(e) => setF('razaoSocial', e.target.value)} />
                    </Field>

                    <Field label="Nome Fantasia">
                      <input className="yeb-input" style={S} placeholder="Nome comercial (opcional)" value={form.nomeFantasia} onChange={(e) => setF('nomeFantasia', e.target.value)} />
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Field label="Telefone">
                        <input className="yeb-input" style={S} placeholder="(00) 00000-0000" value={form.telefone} onChange={(e) => setF('telefone', formatPhone(e.target.value))} />
                      </Field>
                      <Field label="E-mail">
                        <input className="yeb-input" style={S} type="email" placeholder="contato@empresa.com" value={form.email} onChange={(e) => setF('email', e.target.value)} />
                      </Field>
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, paddingTop: 4 }}>
                      <span style={{ color: 'var(--color-danger)' }}>*</span> Campos obrigatórios
                    </div>
                  </div>
                )}

                {/* ── Step 1: Endereço ──────────────────────────────────── */}
                {step === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 14 }}>
                      <Field label="País">
                        <input className="yeb-input" style={S} value={form.pais} onChange={(e) => setF('pais', e.target.value)} />
                      </Field>
                      <Field label="CEP">
                        <div style={{ position: 'relative' }}>
                          <input className="yeb-input" style={S} placeholder="00000-000" value={form.cep} onChange={(e) => { setF('cep', formatCEP(e.target.value)); setCepTouched(true) }} autoFocus />
                          {cepResult.loading && (
                            <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--color-brand-primary)', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite' }} />
                          )}
                        </div>
                        {cepResult.error && <div style={{ fontSize: 11, color: 'var(--color-danger)', marginTop: 3 }}>{cepResult.error}</div>}
                      </Field>
                    </div>

                    {autoFilled && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-brand-primary)', padding: '8px 12px', background: 'rgba(29,78,216,0.06)', borderRadius: 8, border: '1px solid rgba(29,78,216,0.15)' }}>
                        <span style={{ fontSize: 16 }}>✓</span>
                        <span>Endereço preenchido automaticamente. Edite os campos abaixo se necessário.</span>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 14 }}>
                      <Field label="Logradouro">
                        <input className={`yeb-input${autoFilled ? ' autofilled' : ''}`} style={S} placeholder="Rua, Av., Rod. …" value={form.logradouro} onChange={(e) => setF('logradouro', e.target.value)} />
                      </Field>
                      <Field label="Número">
                        <input className="yeb-input" style={S} placeholder="Nº" value={form.numero} onChange={(e) => setF('numero', e.target.value)} />
                      </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Field label="Complemento">
                        <input className="yeb-input" style={S} placeholder="Sala, Bloco, Andar …" value={form.complemento} onChange={(e) => setF('complemento', e.target.value)} />
                      </Field>
                      <Field label="Bairro">
                        <input className={`yeb-input${autoFilled ? ' autofilled' : ''}`} style={S} value={form.bairro} onChange={(e) => setF('bairro', e.target.value)} />
                      </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 14 }}>
                      <Field label="Cidade">
                        <input className={`yeb-input${autoFilled ? ' autofilled' : ''}`} style={S} value={form.cidade} onChange={(e) => setF('cidade', e.target.value)} />
                      </Field>
                      <Field label="UF">
                        <input className={`yeb-input${autoFilled ? ' autofilled' : ''}`} style={S} maxLength={2} value={form.uf} onChange={(e) => setF('uf', e.target.value.toUpperCase())} />
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Dados Comerciais + Resumo ─────────────────── */}
                {step === 2 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <Field label="Segmento" required>
                        <select className="yeb-input" style={S} value={form.segmentoId} onChange={(e) => setF('segmentoId', Number(e.target.value))} autoFocus>
                          {segmentos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                        </select>
                      </Field>
                      <Field label="Etapa do Pipeline">
                        <select className="yeb-input" style={S} value={form.pipeline} onChange={(e) => setF('pipeline', e.target.value)}>
                          {Object.entries(pipelineMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </Field>
                      <Field label="Responsável">
                        <select className="yeb-input" style={S} value={form.usuarioId} onChange={(e) => setF('usuarioId', Number(e.target.value))}>
                          {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                        </select>
                      </Field>
                      <Toggle checked={form.empresaAlvo} onChange={(v) => setF('empresaAlvo', v)} />
                    </div>

                    <SummaryCard form={form} />
                  </div>
                )}
              </Modal.Body>

              {/* Footer */}
              <Modal.Footer style={{ padding: '14px 28px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Left: back or cancel */}
                <div>
                  {step > 0 ? (
                    <Button variant="outline" onPress={() => setStep((s) => s - 1)}>← Anterior</Button>
                  ) : (
                    <Button variant="ghost" onPress={modalState.close}>Cancelar</Button>
                  )}
                </div>

                {/* Right: progress dots + next/save */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {STEPS.map((_, i) => (
                      <div key={i} style={{ width: i === step ? 18 : 6, height: 6, borderRadius: 3, background: i <= step ? 'var(--color-brand-primary)' : 'var(--color-border)', transition: 'all 0.2s' }} />
                    ))}
                  </div>
                  {step < 2 ? (
                    <Button variant="primary" onPress={() => setStep((s) => s + 1)} isDisabled={step === 0 && !canNext0}>
                      Próximo →
                    </Button>
                  ) : (
                    <Button variant="primary" onPress={handleSave} isDisabled={!canSave}>
                      {isEditing ? 'Salvar Alterações' : 'Cadastrar Empresa'}
                    </Button>
                  )}
                </div>
              </Modal.Footer>

            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog state={deleteState} title="Excluir Empresa" message={`Tem certeza que deseja excluir "${toDelete?.razaoSocial}"? Esta ação não pode ser desfeita.`} onConfirm={handleDelete} loading={deleting} />

      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </div>
  )
}
