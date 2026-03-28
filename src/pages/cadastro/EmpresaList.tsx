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
  if (d.length <= 5) return d
  return `${d.slice(0,5)}-${d.slice(5)}`
}

// ─── Form default ──────────────────────────────────────────────────────────────
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

// ─── Sub-components ────────────────────────────────────────────────────────────
const S: React.CSSProperties = {
  width: '100%', padding: '7px 10px', fontSize: 13,
  border: '1px solid var(--color-border)', borderRadius: 6,
  background: 'var(--color-bg-white)', color: 'var(--color-text-primary)',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxSizing: 'border-box',
}

interface FieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
  style?: React.CSSProperties
}
function Field({ label, required, children, style }: FieldProps) {
  return (
    <div style={style}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 5, display: 'flex', gap: 2 }}>
        {label}
        {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
      </div>
      {children}
    </div>
  )
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: 'var(--color-brand-primary)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      paddingBottom: 6, marginBottom: 10,
      borderBottom: '2px solid var(--color-brand-primary)',
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        cursor: 'pointer', userSelect: 'none' as const,
        padding: '7px 10px',
        border: `1px solid ${checked ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
        borderRadius: 6,
        background: checked ? 'rgba(29,78,216,0.05)' : 'var(--color-bg-white)',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ width: 36, height: 20, borderRadius: 10, background: checked ? 'var(--color-brand-primary)' : '#CBD5E1', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: checked ? 19 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: checked ? 'var(--color-brand-primary)' : 'var(--color-text-primary)' }}>
          Empresa Alvo
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
          {checked ? 'Marcada como alvo estratégico' : 'Clique para marcar como alvo'}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function EmpresaList() {
  const navigate = useNavigate()
  const [data, setData] = useState(initialEmpresas)
  const [search, setSearch] = useState('')
  const [filterSegmento, setFilterSegmento] = useState('')
  const [filterAlvo, setFilterAlvo] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
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
      setForm((f) => ({
        ...f,
        logradouro: cepResult.data!.logradouro,
        bairro:     cepResult.data!.bairro,
        cidade:     cepResult.data!.localidade,
        uf:         cepResult.data!.uf,
      }))
      setAutoFilled(true)
    }
  }, [cepResult.data, cepTouched])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data.filter((e) => {
      const matchSearch = !q || e.razaoSocial.toLowerCase().includes(q) || e.nomeFantasia.toLowerCase().includes(q) || e.cnpj.includes(q)
      const matchSeg = !filterSegmento || e.segmentoId === Number(filterSegmento)
      const matchAlvo = filterAlvo === '' ? true : filterAlvo === 'sim' ? e.empresaAlvo : !e.empresaAlvo
      return matchSearch && matchSeg && matchAlvo
    })
  }, [data, search, filterSegmento, filterAlvo])

  const { page, setPage, totalPages, paginated } = usePagination(filtered, 10)

  const openNew = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setCepTouched(false)
    setAutoFilled(false)
    modalState.open()
  }

  const openEdit = (empresa: Empresa) => {
    setEditingId(empresa.id)
    setForm({
      tipo: empresa.tipo, cnpj: empresa.cnpj, cnpjMatriz: empresa.cnpjMatriz ?? '',
      razaoSocial: empresa.razaoSocial, nomeFantasia: empresa.nomeFantasia,
      telefone: empresa.telefone ?? '', email: empresa.email ?? '',
      pais: empresa.pais, cep: empresa.cep ?? '',
      logradouro: empresa.logradouro ?? '', numero: '', complemento: '',
      bairro: empresa.bairro ?? '', cidade: empresa.cidade ?? '', uf: empresa.uf ?? '',
      segmentoId: empresa.segmentoId, pipeline: empresa.pipeline,
      empresaAlvo: empresa.empresaAlvo, usuarioId: empresa.usuarioId,
    })
    setCepTouched(false)
    setAutoFilled(false)
    modalState.open()
  }

  const handleSave = () => {
    const logradouroFull = [form.logradouro, form.numero].filter(Boolean).join(', ')
    const payload = {
      tipo: form.tipo, cnpj: form.cnpj,
      cnpjMatriz: form.tipo === 'filial' ? form.cnpjMatriz : undefined,
      razaoSocial: form.razaoSocial, nomeFantasia: form.nomeFantasia,
      telefone: form.telefone || undefined, email: form.email || undefined,
      pais: form.pais, cep: form.cep || undefined,
      logradouro: logradouroFull || undefined,
      bairro: form.bairro || undefined, cidade: form.cidade || undefined, uf: form.uf || undefined,
      segmentoId: form.segmentoId, pipeline: form.pipeline,
      empresaAlvo: form.empresaAlvo, usuarioId: form.usuarioId,
    }
    if (editingId !== null) {
      updateEmpresa(editingId, payload)
    } else {
      addEmpresa({ id: Date.now(), ...payload, favorita: false, createdAt: new Date().toISOString().split('T')[0] } as Empresa)
    }
    setData([...initialEmpresas])
    modalState.close()
  }

  const handleToggleAlvo = (empresa: Empresa) => {
    updateEmpresa(empresa.id, { empresaAlvo: !empresa.empresaAlvo })
    setData([...initialEmpresas])
  }

  const handleDelete = () => {
    if (!toDelete) return
    setDeleting(true)
    setTimeout(() => {
      deleteEmpresa(toDelete.id)
      setData([...initialEmpresas])
      setDeleting(false); deleteState.close(); setToDelete(null)
    }, 400)
  }

  const setF = (field: string, value: unknown) => {
    if (['logradouro', 'bairro', 'cidade', 'uf'].includes(field)) setAutoFilled(false)
    setForm((f) => ({ ...f, [field]: value }))
  }

  const isEditing = editingId !== null
  const canSave = !!form.razaoSocial && form.cnpj.replace(/\D/g, '').length === 14

  // Input className helper
  const ic = (isAutofilled = false) => `yeb-input${isAutofilled && autoFilled ? ' autofilled' : ''}`

  return (
    <div>
      <PageHeader
        title="Empresas"
        subtitle={`${data.length} empresas cadastradas`}
        actions={<Button variant="primary" onPress={openNew}>+ Cadastrar Empresa</Button>}
      />

      {/* Toolbar */}
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <input className="yeb-input" style={{ ...S, maxWidth: 280 }} placeholder="Buscar por nome ou CNPJ..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        <select className="yeb-input" style={{ ...S, maxWidth: 180 }} value={filterSegmento} onChange={(e) => { setFilterSegmento(e.target.value); setPage(1) }}>
          <option value="">Todos os segmentos</option>
          {segmentos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
        <select className="yeb-input" style={{ ...S, maxWidth: 160 }} value={filterAlvo} onChange={(e) => { setFilterAlvo(e.target.value); setPage(1) }}>
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
                            <Dropdown.Item onPress={() => handleToggleAlvo(empresa)}>
                              {empresa.empresaAlvo ? 'Remover como Alvo' : 'Tornar Empresa Alvo'}
                            </Dropdown.Item>
                            <Dropdown.Item onPress={() => { setToDelete(empresa); deleteState.open() }} style={{ color: 'var(--color-danger)' }}>
                              Excluir
                            </Dropdown.Item>
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

      {/* ── Modal ─────────────────────────────────────────────────────────────── */}
      <Modal isOpen={modalState.isOpen} onOpenChange={modalState.setOpen}>
        <Modal.Backdrop isDismissable={false}>
          <Modal.Container size="lg" className="empresa-modal-container">
            <Modal.Dialog>
              <Modal.Header style={{ padding: '18px 24px 14px' }}>
                <Modal.Heading style={{ fontSize: 18, fontWeight: 600 }}>
                  {isEditing ? 'Editar Empresa' : 'Cadastrar Empresa'}
                </Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>

              <Modal.Body style={{ padding: '0 24px 4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>

                  {/* ── LEFT: Identificação ──────────────────────────────────── */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <SectionHead>🏢 Identificação</SectionHead>

                    {/* Tipo + CNPJ */}
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
                      <Field label="Tipo" required>
                        <select className={ic()} style={S} value={form.tipo} onChange={(e) => setF('tipo', e.target.value)}>
                          <option value="matriz">Matriz</option>
                          <option value="filial">Filial</option>
                        </select>
                      </Field>
                      <Field label="CNPJ" required>
                        <input className={ic()} style={S} placeholder="00.000.000/0000-00" value={form.cnpj}
                          onChange={(e) => setF('cnpj', formatCNPJ(e.target.value))} autoFocus />
                      </Field>
                    </div>

                    {/* CNPJ Matriz (conditional) */}
                    {form.tipo === 'filial' && (
                      <Field label="CNPJ da Matriz" required>
                        <input className={ic()} style={S} placeholder="00.000.000/0000-00" value={form.cnpjMatriz}
                          onChange={(e) => setF('cnpjMatriz', formatCNPJ(e.target.value))} />
                      </Field>
                    )}

                    {/* Razão Social */}
                    <Field label="Razão Social" required>
                      <input className={ic()} style={S} placeholder="Nome jurídico completo" value={form.razaoSocial}
                        onChange={(e) => setF('razaoSocial', e.target.value)} />
                    </Field>

                    {/* Nome Fantasia */}
                    <Field label="Nome Fantasia">
                      <input className={ic()} style={S} placeholder="Nome comercial" value={form.nomeFantasia}
                        onChange={(e) => setF('nomeFantasia', e.target.value)} />
                    </Field>

                    {/* Telefone + Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <Field label="Telefone">
                        <input className={ic()} style={S} placeholder="(00) 00000-0000" value={form.telefone}
                          onChange={(e) => setF('telefone', formatPhone(e.target.value))} />
                      </Field>
                      <Field label="E-mail">
                        <input className={ic()} style={S} type="email" placeholder="contato@empresa.com" value={form.email}
                          onChange={(e) => setF('email', e.target.value)} />
                      </Field>
                    </div>

                    {/* Dados Comerciais */}
                    <div style={{ marginTop: 6 }}>
                      <SectionHead>📊 Dados Comerciais</SectionHead>
                    </div>

                    {/* Segmento + Pipeline */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <Field label="Segmento" required>
                        <select className={ic()} style={S} value={form.segmentoId} onChange={(e) => setF('segmentoId', Number(e.target.value))}>
                          {segmentos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                        </select>
                      </Field>
                      <Field label="Pipeline">
                        <select className={ic()} style={S} value={form.pipeline} onChange={(e) => setF('pipeline', e.target.value)}>
                          {Object.entries(pipelineMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </Field>
                    </div>

                    {/* Responsável */}
                    <Field label="Responsável">
                      <select className={ic()} style={S} value={form.usuarioId} onChange={(e) => setF('usuarioId', Number(e.target.value))}>
                        {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                      </select>
                    </Field>

                    {/* Toggle Empresa Alvo */}
                    <Toggle checked={form.empresaAlvo} onChange={(v) => setF('empresaAlvo', v)} />
                  </div>

                  {/* ── RIGHT: Endereço ──────────────────────────────────────── */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <SectionHead>📍 Endereço</SectionHead>

                    {/* País + CEP */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 10 }}>
                      <Field label="País">
                        <input className={ic()} style={S} value={form.pais} onChange={(e) => setF('pais', e.target.value)} />
                      </Field>
                      <Field label="CEP">
                        <div style={{ position: 'relative' }}>
                          <input className={ic()} style={S} placeholder="00000-000" value={form.cep}
                            onChange={(e) => { setF('cep', formatCEP(e.target.value)); setCepTouched(true) }} />
                          {cepResult.loading && (
                            <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--color-brand-primary)', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite' }} />
                          )}
                        </div>
                        {cepResult.error && <div style={{ fontSize: 11, color: 'var(--color-danger)', marginTop: 2 }}>{cepResult.error}</div>}
                      </Field>
                    </div>

                    {/* Logradouro + Número */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10 }}>
                      <Field label="Logradouro">
                        <input className={ic(true)} style={S} placeholder="Rua, Av., Rod. …" value={form.logradouro}
                          onChange={(e) => setF('logradouro', e.target.value)} />
                      </Field>
                      <Field label="Número">
                        <input className={ic()} style={S} placeholder="Nº" value={form.numero}
                          onChange={(e) => setF('numero', e.target.value)} />
                      </Field>
                    </div>

                    {/* Complemento + Bairro */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <Field label="Complemento">
                        <input className={ic()} style={S} placeholder="Sala, Bloco …" value={form.complemento}
                          onChange={(e) => setF('complemento', e.target.value)} />
                      </Field>
                      <Field label="Bairro">
                        <input className={ic(true)} style={S} value={form.bairro}
                          onChange={(e) => setF('bairro', e.target.value)} />
                      </Field>
                    </div>

                    {/* Cidade + UF */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px', gap: 10 }}>
                      <Field label="Cidade">
                        <input className={ic(true)} style={S} value={form.cidade}
                          onChange={(e) => setF('cidade', e.target.value)} />
                      </Field>
                      <Field label="UF">
                        <input className={ic(true)} style={S} maxLength={2} value={form.uf}
                          onChange={(e) => setF('uf', e.target.value.toUpperCase())} />
                      </Field>
                    </div>

                    {/* Auto-fill feedback */}
                    {autoFilled && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-brand-primary)', padding: '5px 8px', background: 'rgba(29,78,216,0.06)', borderRadius: 5 }}>
                        <span>✓</span>
                        <span>Endereço preenchido automaticamente pelo CEP</span>
                      </div>
                    )}

                    {/* Divider line to fill remaining space */}
                    <div style={{ flex: 1 }} />

                    {/* Required legend */}
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, paddingTop: 4 }}>
                      <span style={{ color: 'var(--color-danger)' }}>*</span> Campos obrigatórios
                    </div>
                  </div>
                </div>
              </Modal.Body>

              <Modal.Footer style={{ padding: '12px 24px 18px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Button variant="outline" onPress={modalState.close}>Cancelar</Button>
                <Button variant="primary" onPress={handleSave} isDisabled={!canSave}>
                  {isEditing ? 'Salvar Alterações' : 'Cadastrar Empresa'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        state={deleteState}
        title="Excluir Empresa"
        message={`Tem certeza que deseja excluir "${toDelete?.razaoSocial}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        loading={deleting}
      />

      {/* CEP spinner keyframes */}
      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </div>
  )
}
