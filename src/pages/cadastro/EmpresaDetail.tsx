import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Modal, useOverlayState } from '@heroui/react'
import { getEmpresa } from '../../data/empresas'
import { segmentos } from '../../data/segmentos'
import { getUsuario, usuarios } from '../../data/usuarios'
import { getProfissionaisByEmpresa } from '../../data/profissionais'
import { getInteracoesByEmpresa, addInteracao } from '../../data/interacoes'
import { getContratosByEmpresa } from '../../data/contratos'
import { getProduto, produtos } from '../../data/produtos'
import { Badge } from '../../components/ui/Badge'
import { ContractStatusBadge, RegularizacaoBadge, EmpresaAlvoBadge } from '../../components/ui/StatusBadge'
import type { PipelineStage, TipoInteracao } from '../../types'

const DESCRICAO_MAX = 5000

const S: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: 14,
  border: '1px solid var(--color-border)', borderRadius: 8,
  background: 'var(--color-bg-white)', color: 'var(--color-text-primary)',
  boxSizing: 'border-box',
}

function Field({ label, required, children, htmlFor }: { label: string; required?: boolean; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'flex', gap: 3, cursor: 'pointer' }}>
        {label}
        {required && (
          <>
            <span aria-hidden="true" style={{ color: 'var(--color-danger)' }}>*</span>
            <span className="sr-only">(obrigatório)</span>
          </>
        )}
      </label>
      {children}
    </div>
  )
}

const EMPTY_INTERACAO = {
  titulo: '',
  descricao: '',
  tipo: 'reuniao' as TipoInteracao,
  efetividade: 'efetivo' as 'efetivo' | 'nao_efetivo',
  isLead: false,
  produtoId: 1,
  linhaComercial: 'Vendas' as 'Vendas' | 'Gestão',
  usuarioId: 1,
  dataHora: new Date().toISOString().slice(0, 16),
}

const pipelineMap: Record<PipelineStage, { label: string; variant: 'neutral' | 'brand' | 'pending' | 'active' }> = {
  prospeccao:  { label: 'Prospecção',  variant: 'neutral'  },
  qualificacao: { label: 'Qualificação', variant: 'brand'  },
  proposta:    { label: 'Proposta',    variant: 'pending'  },
  negociacao:  { label: 'Negociação',  variant: 'pending'  },
  fechado:     { label: 'Fechado',     variant: 'active'   },
}

const tipoInteracaoMap: Record<TipoInteracao, string> = {
  qualificacao_bd:       'Qualificação BD',
  tentativa_agendamento: 'Tentativa de Agendamento',
  proposta_enviada:      'Proposta Enviada',
  reuniao:               'Reunião',
  fechamento:            'Fechamento',
}

const TABS = ['Visão Geral', 'Profissionais', 'Interações', 'Contratos']

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 14, padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ width: 160, color: 'var(--color-text-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  )
}

function tempoRelativo(dataHora: string): string {
  const diff = Date.now() - new Date(dataHora).getTime()
  const dias = Math.floor(diff / 86400000)
  if (dias === 0) return 'Hoje'
  if (dias === 1) return 'Ontem'
  if (dias < 7) return `${dias} dias atrás`
  if (dias < 30) return `${Math.floor(dias / 7)} sem. atrás`
  if (dias < 365) return `${Math.floor(dias / 30)} meses atrás`
  return `${Math.floor(dias / 365)} anos atrás`
}

export default function EmpresaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)

  const [interacoesLocal, setInteracoesLocal] = useState(() =>
    [...getInteracoesByEmpresa(Number(id))].sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
  )
  const [formInteracao, setFormInteracao] = useState(EMPTY_INTERACAO)
  const modalInteracao = useOverlayState()

  const [copied, setCopied] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [draftRestored, setDraftRestored] = useState(false)

  const empresa = getEmpresa(Number(id))

  const DRAFT_KEY = `interacao-draft-${Number(id)}`

  useEffect(() => {
    if (modalInteracao.isOpen && formInteracao.titulo) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formInteracao))
    }
  }, [formInteracao, modalInteracao.isOpen])

  if (!empresa) {
    return (
      <div style={{ textAlign: 'center', padding: 64, color: 'var(--color-text-muted)' }}>
        <p style={{ fontSize: 16, marginBottom: 16 }}>Empresa não encontrada.</p>
        <Button variant="outline" onPress={() => navigate('/cadastro/empresa')}>Voltar</Button>
      </div>
    )
  }

  const segmento = segmentos.find((s) => s.id === empresa.segmentoId)
  const responsavel = getUsuario(empresa.usuarioId)
  const profissionais = getProfissionaisByEmpresa(empresa.id)
  const contratos = getContratosByEmpresa(empresa.id)
  const pipeline = pipelineMap[empresa.pipeline]

  const setFI = (field: string, value: unknown) => setFormInteracao((f) => ({ ...f, [field]: value }))

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const handleSaveInteracao = () => {
    try {
      if (!formInteracao.titulo.trim()) {
        setSaveError('O título é obrigatório.')
        return
      }
      const nova = {
        id: Date.now(),
        empresaId: empresa.id,
        ...formInteracao,
      }
      addInteracao(nova)
      setInteracoesLocal(prev => [...prev, nova].sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()))
      localStorage.removeItem(DRAFT_KEY)
      setFormInteracao(EMPTY_INTERACAO)
      setSaveError(null)
      setDraftRestored(false)
      modalInteracao.close()
    } catch {
      setSaveError('Erro ao registrar interação. Seu rascunho foi preservado, tente novamente.')
    }
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-bg-white)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
  }

  return (
    <div>
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" onPress={() => navigate('/cadastro/empresa')} style={{ fontSize: 13 }}>
          ← Voltar
        </Button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            {empresa.razaoSocial}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            {empresa.nomeFantasia} · {empresa.cnpj}
          </p>
        </div>
        <div className="flex gap-2">
          <EmpresaAlvoBadge isAlvo={empresa.empresaAlvo} />
          <Badge variant={pipeline.variant}>{pipeline.label}</Badge>
        </div>
      </div>

      {/* Tab navigation */}
      <div role="tablist" aria-label="Seções da empresa" style={{ borderBottom: '1px solid var(--color-border)', marginBottom: 24 }} className="flex gap-1">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === i}
            aria-controls={`tabpanel-${i}`}
            id={`tab-${i}`}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 500,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === i ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
              borderBottom: activeTab === i ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 0 && (
        <div role="tabpanel" id="tabpanel-0" aria-labelledby="tab-0" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Dados Cadastrais */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Dados Cadastrais
            </h3>
            <InfoRow label="Razão Social" value={empresa.razaoSocial} />
            <InfoRow label="Nome Fantasia" value={empresa.nomeFantasia} />
            <InfoRow label="CNPJ" value={empresa.cnpj} />
            <InfoRow label="Tipo" value={empresa.tipo === 'matriz' ? 'Matriz' : `Filial (${empresa.cnpjMatriz})`} />
            <InfoRow label="Segmento" value={segmento?.nome} />
            <InfoRow label="Responsável" value={responsavel?.nome} />
            <InfoRow label="Cadastrado em" value={new Date(empresa.createdAt).toLocaleDateString('pt-BR')} />
          </div>

          {/* Localização */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Localização
            </h3>
            <InfoRow label="País" value={empresa.pais} />
            <InfoRow label="CEP" value={empresa.cep} />
            <InfoRow label="Logradouro" value={empresa.logradouro} />
            <InfoRow label="Bairro" value={empresa.bairro} />
            <InfoRow label="Cidade" value={empresa.cidade} />
            <InfoRow label="UF" value={empresa.uf} />
          </div>

          {/* Resumo Comercial */}
          <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Resumo Comercial
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: 'Interações', value: interacoesLocal.length },
                { label: 'Contratos', value: contratos.length },
                { label: 'Profissionais', value: profissionais.length },
                { label: 'Pipeline', value: pipeline.label },
              ].map((kpi) => (
                <div key={kpi.label} style={{ textAlign: 'center', padding: 16, background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-brand-primary)' }}>{kpi.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{kpi.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div role="tabpanel" id="tabpanel-1" aria-labelledby="tab-1" style={cardStyle}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Profissionais ({profissionais.length})
          </h3>
          {profissionais.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: 32 }}>
              Nenhum profissional cadastrado.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Nome', 'Cargo', 'E-mail', 'Telefone', 'Status'].map((h) => (
                    <th key={h} scope="col" style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profissionais.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {p.parentId && <span style={{ color: 'var(--color-text-muted)', marginRight: 6 }}>↳</span>}
                      {p.nome}
                    </td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{p.cargo}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, color: 'var(--color-brand-accent)' }}>{p.email}</span>
                        {p.email && (
                          <button
                            aria-label={`Copiar e-mail de ${p.nome}`}
                            onClick={() => copyToClipboard(p.email!, `email-${p.id}`)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, color: copied === `email-${p.id}` ? 'var(--color-success)' : 'var(--color-text-muted)', fontSize: 12 }}
                            title="Copiar e-mail"
                          >
                            {copied === `email-${p.id}` ? '✓' : '⎘'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{p.telefone}</span>
                        {p.telefone && (
                          <button
                            aria-label={`Copiar telefone de ${p.nome}`}
                            onClick={() => copyToClipboard(p.telefone!, `tel-${p.id}`)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, color: copied === `tel-${p.id}` ? 'var(--color-success)' : 'var(--color-text-muted)', fontSize: 12 }}
                            title="Copiar telefone"
                          >
                            {copied === `tel-${p.id}` ? '✓' : '⎘'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Badge variant={p.ativo ? 'active' : 'inactive'}>{p.ativo ? 'Ativo' : 'Inativo'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 2 && (
        <div role="tabpanel" id="tabpanel-2" aria-labelledby="tab-2" style={cardStyle}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Histórico de Interações ({interacoesLocal.length})
            </h3>
            <Button variant="primary" onPress={() => {
              const saved = localStorage.getItem(DRAFT_KEY)
              if (saved) {
                try {
                  setFormInteracao(JSON.parse(saved))
                  setDraftRestored(true)
                } catch {
                  setFormInteracao(EMPTY_INTERACAO)
                  setDraftRestored(false)
                }
              } else {
                setFormInteracao(EMPTY_INTERACAO)
                setDraftRestored(false)
              }
              setSaveError(null)
              modalInteracao.open()
            }}>
              + Nova Interação
            </Button>
          </div>
          {interacoesLocal.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: 32 }}>
              Nenhuma interação registrada.
            </p>
          ) : (
            <div aria-live="polite" aria-label="Histórico de interações" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {interacoesLocal.map((interacao) => (
                <div
                  key={interacao.id}
                  style={{
                    padding: 16,
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `3px solid ${interacao.efetividade === 'efetivo' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{interacao.titulo}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span>{new Date(interacao.dataHora).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span style={{ background: 'var(--color-bg-muted)', padding: '1px 6px', borderRadius: 10, fontSize: 10, fontWeight: 500, color: 'var(--color-text-secondary)' }}>{tempoRelativo(interacao.dataHora)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="neutral">{tipoInteracaoMap[interacao.tipo]}</Badge>
                      <Badge variant={interacao.efetividade === 'efetivo' ? 'active' : 'danger'}>
                        {interacao.efetividade === 'efetivo' ? 'Efetivo' : 'Não Efetivo'}
                      </Badge>
                      {interacao.isLead && <Badge variant="brand">Lead</Badge>}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 8 }}>{interacao.descricao}</p>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>
                    {interacao.linhaComercial} · {getProduto(interacao.produtoId)?.nome}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 3 && (
        <div role="tabpanel" id="tabpanel-3" aria-labelledby="tab-3" style={cardStyle}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Contratos ({contratos.length})
          </h3>
          {contratos.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: 32 }}>
              Nenhum contrato encontrado.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Nº', 'Status', 'Regularização', 'Produtos', 'Valor Total', 'Valor Mensal', 'Vencimento'].map((h) => (
                    <th key={h} scope="col" style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contratos.map((contrato) => (
                  <tr key={contrato.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>#{contrato.numero}</td>
                    <td style={{ padding: '12px' }}><ContractStatusBadge status={contrato.status} /></td>
                    <td style={{ padding: '12px' }}><RegularizacaoBadge status={contrato.regularizacao} /></td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {contrato.produtos.map((pid) => getProduto(pid)?.nome).join(', ')}
                    </td>
                    <td style={{ padding: '12px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {contrato.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {contrato.valorMedioMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {new Date(contrato.dataVencimento).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Nova Interação */}
      <Modal isOpen={modalInteracao.isOpen} onOpenChange={modalInteracao.setOpen}>
        <Modal.Backdrop isDismissable={false}>
          <Modal.Container size="md">
            <Modal.Dialog>
              <Modal.Header style={{ padding: '20px 24px 16px' }}>
                <Modal.Heading style={{ fontSize: 17, fontWeight: 700 }}>Nova Interação</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>

              <Modal.Body style={{ padding: '0 24px 8px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {draftRestored && (
                  <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-brand-primary)', padding: '8px 12px', background: 'rgba(30,74,159,0.06)', borderRadius: 8, border: '1px solid rgba(30,74,159,0.15)' }}>
                    <span>↩</span>
                    <span>Rascunho anterior restaurado automaticamente.</span>
                  </div>
                )}

                {saveError && (
                  <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-danger)', padding: '8px 12px', background: 'rgba(239,68,68,0.06)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                    <span>⚠</span>
                    <span>{saveError}</span>
                  </div>
                )}

                <Field label="Título" required htmlFor="interacao-titulo">
                  <input id="interacao-titulo" aria-required="true" className="yeb-input" style={S} placeholder="Ex: Reunião de apresentação" value={formInteracao.titulo} onChange={(e) => setFI('titulo', e.target.value)} autoFocus />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Tipo" required htmlFor="interacao-tipo">
                    <select id="interacao-tipo" aria-required="true" className="yeb-input" style={S} value={formInteracao.tipo} onChange={(e) => setFI('tipo', e.target.value)}>
                      {Object.entries(tipoInteracaoMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </Field>
                  <Field label="Efetividade" required htmlFor="interacao-efetividade">
                    <select id="interacao-efetividade" aria-required="true" className="yeb-input" style={S} value={formInteracao.efetividade} onChange={(e) => setFI('efetividade', e.target.value)}>
                      <option value="efetivo">Efetivo</option>
                      <option value="nao_efetivo">Não Efetivo</option>
                    </select>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Data e Hora" required htmlFor="interacao-data">
                    <input id="interacao-data" aria-required="true" className="yeb-input" style={S} type="datetime-local" value={formInteracao.dataHora} onChange={(e) => setFI('dataHora', e.target.value)} />
                  </Field>
                  <Field label="Linha Comercial" htmlFor="interacao-linha">
                    <select id="interacao-linha" className="yeb-input" style={S} value={formInteracao.linhaComercial} onChange={(e) => setFI('linhaComercial', e.target.value)}>
                      <option value="Vendas">Vendas</option>
                      <option value="Gestão">Gestão</option>
                    </select>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Produto" htmlFor="interacao-produto">
                    <select id="interacao-produto" className="yeb-input" style={S} value={formInteracao.produtoId} onChange={(e) => setFI('produtoId', Number(e.target.value))}>
                      {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                  </Field>
                  <Field label="Responsável" htmlFor="interacao-responsavel">
                    <select id="interacao-responsavel" className="yeb-input" style={S} value={formInteracao.usuarioId} onChange={(e) => setFI('usuarioId', Number(e.target.value))}>
                      {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Descrição" htmlFor="interacao-descricao">
                  <textarea
                    id="interacao-descricao"
                    className="yeb-input"
                    style={{ ...S, resize: 'vertical', minHeight: 80 }}
                    placeholder="Descreva o que aconteceu nessa interação…"
                    value={formInteracao.descricao}
                    maxLength={DESCRICAO_MAX}
                    onChange={(e) => setFI('descricao', e.target.value)}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    fontSize: 11,
                    marginTop: 4,
                    color: formInteracao.descricao.length > DESCRICAO_MAX * 0.9
                      ? 'var(--color-danger)'
                      : 'var(--color-text-muted)'
                  }}>
                    {formInteracao.descricao.length}/{DESCRICAO_MAX}
                  </div>
                </Field>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--color-text-secondary)', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                  <input type="checkbox" checked={formInteracao.isLead} onChange={(e) => setFI('isLead', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--color-brand-primary)' }} />
                  Marcar como Lead
                </label>
              </Modal.Body>

              <Modal.Footer style={{ padding: '14px 24px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                {formInteracao.titulo ? (
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    💾 Rascunho salvo
                  </span>
                ) : (
                  <span />
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button variant="ghost" onPress={modalInteracao.close}>Cancelar</Button>
                  <Button variant="primary" onPress={handleSaveInteracao} isDisabled={!formInteracao.titulo}>
                    Registrar Interação
                  </Button>
                </div>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  )
}
