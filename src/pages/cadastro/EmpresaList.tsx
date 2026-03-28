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

const EMPTY_FORM = {
  tipo: 'matriz' as 'matriz' | 'filial',
  cnpj: '',
  cnpjMatriz: '',
  razaoSocial: '',
  nomeFantasia: '',
  pais: 'Brasil',
  cep: '',
  logradouro: '',
  bairro: '',
  cidade: '',
  uf: '',
  segmentoId: 1,
  empresaAlvo: false,
  usuarioId: 1,
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
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
  marginBottom: 4,
  display: 'block',
}

export default function EmpresaList() {
  const navigate = useNavigate()
  const [data, setData] = useState(initialEmpresas)
  const [search, setSearch] = useState('')
  const [filterSegmento, setFilterSegmento] = useState('')
  const [filterAlvo, setFilterAlvo] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)

  const modalState = useOverlayState()
  const deleteState = useOverlayState()
  const [deleting, setDeleting] = useState(false)

  const cepResult = useViaCep(form.cep)

  useEffect(() => {
    if (cepResult.data) {
      setForm((f) => ({
        ...f,
        logradouro: cepResult.data!.logradouro,
        bairro: cepResult.data!.bairro,
        cidade: cepResult.data!.localidade,
        uf: cepResult.data!.uf,
      }))
    }
  }, [cepResult.data])

  const filtered = useMemo(() => {
    return data.filter((e) => {
      const q = search.toLowerCase()
      const matchSearch = !q || e.razaoSocial.toLowerCase().includes(q) || e.nomeFantasia.toLowerCase().includes(q) || e.cnpj.includes(q)
      const matchSeg = !filterSegmento || e.segmentoId === Number(filterSegmento)
      const matchAlvo = filterAlvo === '' ? true : filterAlvo === 'sim' ? e.empresaAlvo : !e.empresaAlvo
      return matchSearch && matchSeg && matchAlvo
    })
  }, [data, search, filterSegmento, filterAlvo])

  const { page, setPage, totalPages, paginated } = usePagination(filtered, 10)

  const handleOpenNew = () => {
    setForm(EMPTY_FORM)
    modalState.open()
  }

  const handleSave = () => {
    const newEmpresa: Empresa = {
      id: Date.now(),
      ...form,
      favorita: false,
      pipeline: 'prospeccao',
      createdAt: new Date().toISOString().split('T')[0],
    }
    addEmpresa(newEmpresa)
    setData([...initialEmpresas])
    modalState.close()
  }

  const handleToggleAlvo = (empresa: Empresa) => {
    updateEmpresa(empresa.id, { empresaAlvo: !empresa.empresaAlvo })
    setData([...initialEmpresas])
  }

  const handleDelete = () => {
    if (!selectedEmpresa) return
    setDeleting(true)
    setTimeout(() => {
      deleteEmpresa(selectedEmpresa.id)
      setData([...initialEmpresas])
      setDeleting(false)
      deleteState.close()
      setSelectedEmpresa(null)
    }, 400)
  }

  const setF = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }))

  return (
    <div>
      <PageHeader
        title="Empresas"
        subtitle={`${data.length} empresas cadastradas`}
        actions={
          <Button variant="primary" onPress={handleOpenNew}>
            + Cadastrar Empresa
          </Button>
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
        <select
          style={{ ...inputStyle, maxWidth: 180 }}
          value={filterSegmento}
          onChange={(e) => { setFilterSegmento(e.target.value); setPage(1) }}
        >
          <option value="">Todos os segmentos</option>
          {segmentos.map((s) => (
            <option key={s.id} value={s.id}>{s.nome}</option>
          ))}
        </select>
        <select
          style={{ ...inputStyle, maxWidth: 150 }}
          value={filterAlvo}
          onChange={(e) => { setFilterAlvo(e.target.value); setPage(1) }}
        >
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
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
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
                  <tr
                    key={empresa.id}
                    style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-muted)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                      {empresa.cnpj}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{empresa.razaoSocial}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{empresa.nomeFantasia}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {segmento?.nome ?? '—'}
                    </td>
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
                            <Dropdown.Item onPress={() => handleToggleAlvo(empresa)}>
                              {empresa.empresaAlvo ? 'Remover como Alvo' : 'Tornar Empresa Alvo'}
                            </Dropdown.Item>
                            <Dropdown.Item
                              onPress={() => { setSelectedEmpresa(empresa); deleteState.open() }}
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

      {/* Modal: Cadastrar Empresa */}
      <Modal isOpen={modalState.isOpen} onOpenChange={modalState.setOpen}>
        <Modal.Backdrop>
          <Modal.Container size="lg">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Cadastrar Empresa</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <div style={{ display: 'grid', gap: 16 }}>
                  {/* Row 1 */}
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
                      <input style={inputStyle} placeholder="00.000.000/0000-00" value={form.cnpj} onChange={(e) => setF('cnpj', e.target.value)} />
                    </div>
                  </div>

                  {/* CNPJ Matriz (conditional) */}
                  {form.tipo === 'filial' && (
                    <div>
                      <label style={labelStyle}>CNPJ da Matriz *</label>
                      <input style={inputStyle} placeholder="00.000.000/0000-00" value={form.cnpjMatriz} onChange={(e) => setF('cnpjMatriz', e.target.value)} />
                    </div>
                  )}

                  {/* Row 2 */}
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

                  {/* Row 3 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>País</label>
                      <input style={inputStyle} value={form.pais} onChange={(e) => setF('pais', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>CEP</label>
                      <input
                        style={inputStyle}
                        placeholder="00000-000"
                        value={form.cep}
                        onChange={(e) => setF('cep', e.target.value)}
                      />
                      {cepResult.loading && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Buscando...</span>}
                      {cepResult.error && <span style={{ fontSize: 12, color: 'var(--color-danger)' }}>{cepResult.error}</span>}
                    </div>
                  </div>

                  {/* Row 4: Address auto-fill */}
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

                  {/* Row 5 */}
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

                  {/* Row 6 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Segmento *</label>
                      <select style={inputStyle} value={form.segmentoId} onChange={(e) => setF('segmentoId', Number(e.target.value))}>
                        {segmentos.map((s) => (
                          <option key={s.id} value={s.id}>{s.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Responsável</label>
                      <select style={inputStyle} value={form.usuarioId} onChange={(e) => setF('usuarioId', Number(e.target.value))}>
                        {usuarios.map((u) => (
                          <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <label style={{ ...labelStyle, marginBottom: 8 }}>Empresa Alvo</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={form.empresaAlvo}
                          onChange={(e) => setF('empresaAlvo', e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: 'var(--color-brand-primary)' }}
                        />
                        <span style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>Marcar como alvo</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline" onPress={modalState.close}>Cancelar</Button>
                <Button
                  variant="primary"
                  onPress={handleSave}
                  isDisabled={!form.razaoSocial || !form.cnpj}
                >
                  Cadastrar
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
        message={`Tem certeza que deseja excluir "${selectedEmpresa?.razaoSocial}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
