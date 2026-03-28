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

const pipelineMap: Record<PipelineStage, { label: string; variant: 'neutral' | 'brand' | 'pending' | 'active' }> = {
  prospeccao:  { label: 'Prospecção',  variant: 'neutral'  },
  qualificacao: { label: 'Qualificação', variant: 'brand'  },
  proposta:    { label: 'Proposta',    variant: 'pending'  },
  negociacao:  { label: 'Negociação',  variant: 'pending'  },
  fechado:     { label: 'Fechado',     variant: 'active'   },
}

// ─── Masks ────────────────────────────────────────────────────────────────────
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
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

// ─── Form default ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  tipo: 'matriz' as 'matriz' | 'filial',
  cnpj: '',
  cnpjMatriz: '',
  razaoSocial: '',
  nomeFantasia: '',
  telefone: '',
  email: '',
  pais: 'Brasil',
  cep: '',
  logradouro: '',
  bairro: '',
  cidade: '',
  uf: '',
  segmentoId: 1,
  pipeline: 'prospeccao' as PipelineStage,
  empresaAlvo: false,
  usuarioId: 1,
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
  marginBottom: 4,
  display: 'block',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 8, borderBottom: '1px solid var(--color-border)', marginBottom: 4 }}>
      {children}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
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

  const modalState = useOverlayState()
  const deleteState = useOverlayState()

  // CEP auto-fill — only when cep field changes (not when editing pre-fills other address fields)
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
    modalState.open()
  }

  const openEdit = (empresa: Empresa) => {
    setEditingId(empresa.id)
    setForm({
      tipo:        empresa.tipo,
      cnpj:        empresa.cnpj,
      cnpjMatriz:  empresa.cnpjMatriz ?? '',
      razaoSocial: empresa.razaoSocial,
      nomeFantasia: empresa.nomeFantasia,
      telefone:    empresa.telefone ?? '',
      email:       empresa.email ?? '',
      pais:        empresa.pais,
      cep:         empresa.cep ?? '',
      logradouro:  empresa.logradouro ?? '',
      bairro:      empresa.bairro ?? '',
      cidade:      empresa.cidade ?? '',
      uf:          empresa.uf ?? '',
      segmentoId:  empresa.segmentoId,
      pipeline:    empresa.pipeline,
      empresaAlvo: empresa.empresaAlvo,
      usuarioId:   empresa.usuarioId,
    })
    setCepTouched(false)
    modalState.open()
  }

  const handleSave = () => {
    const payload = {
      tipo:         form.tipo,
      cnpj:         form.cnpj,
      cnpjMatriz:   form.tipo === 'filial' ? form.cnpjMatriz : undefined,
      razaoSocial:  form.razaoSocial,
      nomeFantasia: form.nomeFantasia,
      telefone:     form.telefone || undefined,
      email:        form.email || undefined,
      pais:         form.pais,
      cep:          form.cep || undefined,
      logradouro:   form.logradouro || undefined,
      bairro:       form.bairro || undefined,
      cidade:       form.cidade || undefined,
      uf:           form.uf || undefined,
      segmentoId:   form.segmentoId,
      pipeline:     form.pipeline,
      empresaAlvo:  form.empresaAlvo,
      usuarioId:    form.usuarioId,
    }

    if (editingId !== null) {
      updateEmpresa(editingId, payload)
    } else {
      addEmpresa({
        id: Date.now(),
        ...payload,
        favorita: false,
        createdAt: new Date().toISOString().split('T')[0],
      } as Empresa)
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
      setDeleting(false)
      deleteState.close()
      setToDelete(null)
    }, 400)
  }

  const setF = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }))

  const isEditing = editingId !== null

  return (
    <div>
      <PageHeader
        title="Empresas"
        subtitle={`${data.length} empresas cadastradas`}
        actions={
          <Button variant="primary" onPress={openNew}>+ Cadastrar Empresa</Button>
        }
      />

      {/* Toolbar */}
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <input
          style={{ ...inputStyle, maxWidth: 280 }}
          placeholder="Buscar por nome ou CNPJ..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        <select style={{ ...inputStyle, maxWidth: 180 }} value={filterSegmento} onChange={(e) => { setFilterSegmento(e.target.value); setPage(1) }}>
          <option value="">Todos os segmentos</option>
          {segmentos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
        <select style={{ ...inputStyle, maxWidth: 160 }} value={filterAlvo} onChange={(e) => { setFilterAlvo(e.target.value); setPage(1) }}>
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
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
                  Nenhuma empresa encontrada
                </td>
              </tr>
            ) : (
              paginated.map((empresa) => {
                const segmento = segmentos.find((s) => s.id === empresa.segmentoId)
                const pipeline = pipelineMap[empresa.pipeline]
                return (
                  <tr key={empresa.id}
                    style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-muted)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{empresa.cnpj}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{empresa.razaoSocial}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{empresa.nomeFantasia}</div>
                      {empresa.telefone && <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{empresa.telefone}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{segmento?.nome ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant="neutral">{empresa.tipo === 'matriz' ? 'Matriz' : 'Filial'}</Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={pipeline.variant}>{pipeline.label}</Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <EmpresaAlvoBadge isAlvo={empresa.empresaAlvo} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Dropdown>
                        <Dropdown.Trigger>
                          <Button variant="ghost" style={{ padding: '4px 10px', fontSize: 18, lineHeight: 1 }}>⋯</Button>
                        </Dropdown.Trigger>
                        <Dropdown.Popover>
                          <Dropdown.Menu>
                            <Dropdown.Item onPress={() => navigate(`/cadastro/empresa/${empresa.id}`)}>
                              Ver Detalhes
                            </Dropdown.Item>
                            <Dropdown.Item onPress={() => openEdit(empresa)}>
                              Editar
                            </Dropdown.Item>
                            <Dropdown.Item onPress={() => handleToggleAlvo(empresa)}>
                              {empresa.empresaAlvo ? 'Remover como Alvo' : 'Tornar Empresa Alvo'}
                            </Dropdown.Item>
                            <Dropdown.Item
                              onPress={() => { setToDelete(empresa); deleteState.open() }}
                              style={{ color: 'var(--color-danger)' }}
                            >
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

      {/* Modal: Cadastrar / Editar Empresa */}
      <Modal isOpen={modalState.isOpen} onOpenChange={modalState.setOpen}>
        <Modal.Backdrop isDismissable={false}>
          <Modal.Container size="lg">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>{isEditing ? 'Editar Empresa' : 'Cadastrar Empresa'}</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <div style={{ display: 'grid', gap: 20 }}>

                  {/* Seção: Identificação */}
                  <div style={{ display: 'grid', gap: 12 }}>
                    <SectionTitle>Identificação</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Tipo *</label>
                        <select style={inputStyle} value={form.tipo} onChange={(e) => setF('tipo', e.target.value)}>
                          <option value="matriz">Matriz</option>
                          <option value="filial">Filial</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>CNPJ *</label>
                        <input
                          style={inputStyle}
                          placeholder="00.000.000/0000-00"
                          value={form.cnpj}
                          onChange={(e) => setF('cnpj', formatCNPJ(e.target.value))}
                        />
                      </div>
                    </div>

                    {form.tipo === 'filial' && (
                      <div>
                        <label style={labelStyle}>CNPJ da Matriz *</label>
                        <input
                          style={inputStyle}
                          placeholder="00.000.000/0000-00"
                          value={form.cnpjMatriz}
                          onChange={(e) => setF('cnpjMatriz', formatCNPJ(e.target.value))}
                        />
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Razão Social *</label>
                        <input style={inputStyle} placeholder="Nome completo da empresa" value={form.razaoSocial} onChange={(e) => setF('razaoSocial', e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Nome Fantasia</label>
                        <input style={inputStyle} placeholder="Nome comercial" value={form.nomeFantasia} onChange={(e) => setF('nomeFantasia', e.target.value)} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Telefone</label>
                        <input
                          style={inputStyle}
                          placeholder="(00) 00000-0000"
                          value={form.telefone}
                          onChange={(e) => setF('telefone', formatPhone(e.target.value))}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>E-mail</label>
                        <input style={inputStyle} type="email" placeholder="contato@empresa.com" value={form.email} onChange={(e) => setF('email', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Seção: Endereço */}
                  <div style={{ display: 'grid', gap: 12 }}>
                    <SectionTitle>Endereço</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>País</label>
                        <input style={inputStyle} value={form.pais} onChange={(e) => setF('pais', e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>CEP</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            style={inputStyle}
                            placeholder="00000-000"
                            value={form.cep}
                            onChange={(e) => { setF('cep', e.target.value); setCepTouched(true) }}
                          />
                          {cepResult.loading && (
                            <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--color-text-muted)' }}>
                              Buscando...
                            </span>
                          )}
                        </div>
                        {cepResult.error && <span style={{ fontSize: 11, color: 'var(--color-danger)' }}>{cepResult.error}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Logradouro</label>
                        <input style={inputStyle} placeholder="Auto preenchido pelo CEP" value={form.logradouro} onChange={(e) => setF('logradouro', e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Bairro</label>
                        <input style={inputStyle} value={form.bairro} onChange={(e) => setF('bairro', e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Cidade</label>
                        <input style={inputStyle} value={form.cidade} onChange={(e) => setF('cidade', e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>UF</label>
                        <input style={inputStyle} maxLength={2} value={form.uf} onChange={(e) => setF('uf', e.target.value.toUpperCase())} />
                      </div>
                    </div>
                  </div>

                  {/* Seção: Comercial */}
                  <div style={{ display: 'grid', gap: 12 }}>
                    <SectionTitle>Dados Comerciais</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Segmento *</label>
                        <select style={inputStyle} value={form.segmentoId} onChange={(e) => setF('segmentoId', Number(e.target.value))}>
                          {segmentos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Pipeline</label>
                        <select style={inputStyle} value={form.pipeline} onChange={(e) => setF('pipeline', e.target.value)}>
                          {Object.entries(pipelineMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Responsável</label>
                        <select style={inputStyle} value={form.usuarioId} onChange={(e) => setF('usuarioId', Number(e.target.value))}>
                          {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                        </select>
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.empresaAlvo}
                        onChange={(e) => setF('empresaAlvo', e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: 'var(--color-brand-primary)' }}
                      />
                      <span style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>Marcar como Empresa Alvo</span>
                    </label>
                  </div>

                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline" onPress={modalState.close}>Cancelar</Button>
                <Button variant="primary" onPress={handleSave} isDisabled={!form.razaoSocial || !form.cnpj}>
                  {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
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
    </div>
  )
}
