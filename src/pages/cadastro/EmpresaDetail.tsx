import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Modal, useOverlayState } from '@heroui/react'
import { getEmpresa } from '../../data/empresas'
import { segmentos } from '../../data/segmentos'
import { getUsuario, usuarios } from '../../data/usuarios'
import { getProfissionaisByEmpresa, addProfissional, updateProfissional, getNextProfId } from '../../data/profissionais'
import { getInteracoesByEmpresa, addInteracao } from '../../data/interacoes'
import { getContratosByEmpresa, addContrato, getNextNumero } from '../../data/contratos'
import { getProduto, produtos } from '../../data/produtos'
import { Badge } from '../../components/ui/Badge'
import { ContractStatusBadge, RegularizacaoBadge, EmpresaAlvoBadge } from '../../components/ui/StatusBadge'
import type { PipelineStage, TipoInteracao, StatusRelacionamento, Profissional } from '../../types'

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

const EMPTY_PROF = {
  nome: '',
  cargo: '',
  email: '',
  telefone: '',
  linkedin: '',
  parentId: undefined as number | undefined,
  ativo: true,
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

const pipelineMap: Record<PipelineStage, { label: string; variant: 'neutral' | 'brand' | 'pending' | 'active' | 'danger' | 'inactive' }> = {
  prospeccao:       { label: 'Prospecção',       variant: 'neutral'   },
  qualificacao:     { label: 'Qualificação',      variant: 'brand'     },
  proposta_enviada: { label: 'Proposta Enviada',  variant: 'pending'   },
  em_negociacao:    { label: 'Em Negociação',     variant: 'pending'   },
  proposta_aceita:  { label: 'Proposta Aceita',   variant: 'active'    },
  proposta_recusada:{ label: 'Proposta Recusada', variant: 'danger'    },
  fechado:          { label: 'Fechado',           variant: 'inactive'  },
}

const tipoInteracaoMap: Record<TipoInteracao, { label: string; icon: string }> = {
  reuniao_presencial:    { label: 'Reunião Presencial',     icon: '🤝' },
  videoconferencia:      { label: 'Videoconferência',        icon: '📹' },
  ligacao:               { label: 'Ligação',                 icon: '📞' },
  email:                 { label: 'E-mail',                  icon: '✉️'  },
  whatsapp:              { label: 'WhatsApp',                icon: '💬' },
  qualificacao_bd:       { label: 'Qualificação BD',         icon: '🔍' },
  tentativa_agendamento: { label: 'Tentativa de Agendamento',icon: '📅' },
  proposta_enviada:      { label: 'Proposta Enviada',        icon: '📄' },
  reuniao:               { label: 'Reunião',                 icon: '📋' },
  fechamento:            { label: 'Fechamento',              icon: '✅' },
  outro:                 { label: 'Outro',                   icon: '•'  },
}

const statusRelacionamentoMap: Record<StatusRelacionamento, { label: string; color: string }> = {
  lead:          { label: 'Lead',          color: '#94A3B8' },
  prospect:      { label: 'Prospect',      color: '#3B82F6' },
  cliente_ativo: { label: 'Cliente Ativo', color: '#10B981' },
  ex_cliente:    { label: 'Ex-Cliente',    color: '#F59E0B' },
  parceiro:      { label: 'Parceiro',      color: '#8B5CF6' },
  nao_definido:  { label: 'Não Definido',  color: '#94A3B8' },
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

  // Profissionais — lista local + sort + busca
  const [profissionaisLocal, setProfissionaisLocal] = useState(() => getProfissionaisByEmpresa(Number(id)))
  const [profBusca, setProfBusca] = useState('')
  const [profSort, setProfSort] = useState<{ field: 'nome' | 'cargo'; dir: 'asc' | 'desc' }>({ field: 'nome', dir: 'asc' })

  // Profissionais — modal visualização/edição
  const [profSelecionado, setProfSelecionado] = useState<Profissional | null>(null)
  const [profModoEdicao, setProfModoEdicao] = useState(false)
  const [profEditForm, setProfEditForm] = useState(EMPTY_PROF)

  // Profissionais — modal novo
  const [modalNovoProf, setModalNovoProf] = useState(false)
  const [novoProfForm, setNovoProfForm] = useState(EMPTY_PROF)
  const [novoProfInfosAbertas, setNovoProfInfosAbertas] = useState(false)

  // Interação selecionada para leitura
  const [interacaoSelecionada, setInteracaoSelecionada] = useState<typeof interacoesLocal[0] | null>(null)

  // Contratos
  const [contratosLocal, setContratosLocal] = useState(() => getContratosByEmpresa(Number(id)))
  const [modalContrato, setModalContrato] = useState(false)
  const [contratoStep, setContratoStep] = useState(0)
  const [contratoForm, setContratoForm] = useState({
    produtos: [] as number[],
    valorTotal: '',
    valorMedioMensal: '',
    dataInicio: '',
    dataVencimento: '',
    status: 'ativo' as 'ativo' | 'vencendo' | 'vencido' | 'cancelado',
    regularizacao: 'regular' as 'regular' | 'pendente',
    criadoPor: 1,
  })
  const setCF = (k: string, v: unknown) => setContratoForm((f) => ({ ...f, [k]: v }))

  // Interações — filtros
  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [filtroEfetividade, setFiltroEfetividade] = useState<string>('')
  const [filtroProduto, setFiltroProduto] = useState<string>('')
  const [filtroUsuario, setFiltroUsuario] = useState<string>('')

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
  const contratos = getContratosByEmpresa(empresa.id)
  const pipeline = pipelineMap[empresa.pipeline]

  const profissionaisFiltrados = useMemo(() => {
    const q = profBusca.toLowerCase()
    return profissionaisLocal
      .filter((p) => !q || p.nome.toLowerCase().includes(q) || p.cargo.toLowerCase().includes(q))
      .sort((a, b) => {
        const va = a[profSort.field].toLowerCase()
        const vb = b[profSort.field].toLowerCase()
        return profSort.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      })
  }, [profissionaisLocal, profBusca, profSort])

  const toggleSort = (field: 'nome' | 'cargo') =>
    setProfSort((s) => ({ field, dir: s.field === field && s.dir === 'asc' ? 'desc' : 'asc' }))

  const interacoesFiltradas = useMemo(() => {
    return interacoesLocal.filter((i) => {
      if (filtroTipo && i.tipo !== filtroTipo) return false
      if (filtroEfetividade && i.efetividade !== filtroEfetividade) return false
      if (filtroProduto && String(i.produtoId) !== filtroProduto) return false
      if (filtroUsuario && String(i.usuarioId) !== filtroUsuario) return false
      return true
    })
  }, [interacoesLocal, filtroTipo, filtroEfetividade, filtroProduto, filtroUsuario])

  const filtrosAtivos = [filtroTipo, filtroEfetividade, filtroProduto, filtroUsuario].filter(Boolean).length

  const limparFiltros = () => {
    setFiltroTipo(''); setFiltroEfetividade(''); setFiltroProduto(''); setFiltroUsuario('')
  }

  const handleSaveContrato = () => {
    if (contratoForm.produtos.length === 0 || !contratoForm.dataInicio || !contratoForm.dataVencimento) return
    const novo = {
      id: Date.now(),
      numero: getNextNumero(),
      empresaId: empresa.id,
      status: contratoForm.status,
      regularizacao: contratoForm.regularizacao,
      valorTotal: Number(contratoForm.valorTotal) || 0,
      valorMedioMensal: Number(contratoForm.valorMedioMensal) || 0,
      produtos: contratoForm.produtos,
      dataInicio: contratoForm.dataInicio,
      dataVencimento: contratoForm.dataVencimento,
      criadoPor: contratoForm.criadoPor,
    }
    addContrato(novo)
    setContratosLocal((prev) => [...prev, novo])
    setModalContrato(false)
    setContratoStep(0)
    setContratoForm({ produtos: [], valorTotal: '', valorMedioMensal: '', dataInicio: '', dataVencimento: '', status: 'ativo', regularizacao: 'regular', criadoPor: 1 })
  }

  const toggleProduto = (id: number) =>
    setCF('produtos', contratoForm.produtos.includes(id)
      ? contratoForm.produtos.filter((p) => p !== id)
      : [...contratoForm.produtos, id]
    )

  const handleSaveNovoProfissional = () => {
    if (!novoProfForm.nome || !novoProfForm.cargo) return
    const novo: Profissional = {
      id: getNextProfId(),
      empresaId: empresa.id,
      nome: novoProfForm.nome,
      cargo: novoProfForm.cargo,
      email: novoProfForm.email,
      telefone: novoProfForm.telefone,
      linkedin: novoProfForm.linkedin || undefined,
      parentId: novoProfForm.parentId,
      ativo: novoProfForm.ativo,
    }
    addProfissional(novo)
    setProfissionaisLocal((prev) => [...prev, novo])
    setModalNovoProf(false)
    setNovoProfForm(EMPTY_PROF)
    setNovoProfInfosAbertas(false)
  }

  const handleSaveProfEdit = () => {
    if (!profSelecionado) return
    const updated: Profissional = {
      ...profSelecionado,
      nome: profEditForm.nome,
      cargo: profEditForm.cargo,
      email: profEditForm.email,
      telefone: profEditForm.telefone,
      linkedin: profEditForm.linkedin || undefined,
      parentId: profEditForm.parentId,
      ativo: profEditForm.ativo,
    }
    updateProfissional(updated)
    setProfissionaisLocal((prev) => prev.map((p) => p.id === updated.id ? updated : p))
    setProfSelecionado(updated)
    setProfModoEdicao(false)
  }

  const setFI = (field: string, value: unknown) => setFormInteracao((f) => ({ ...f, [field]: value }))

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const handleSaveInteracao = () => {
    try {
      if (!formInteracao.dataHora) {
        setSaveError('A data e hora são obrigatórias.')
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
            <div style={{ display: 'flex', gap: 8, fontSize: 14, padding: '6px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
              <span style={{ width: 160, color: 'var(--color-text-muted)', flexShrink: 0 }}>Status de Relacionamento</span>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 12,
                background: `${statusRelacionamentoMap[empresa.statusRelacionamento]?.color}22`,
                color: statusRelacionamentoMap[empresa.statusRelacionamento]?.color,
              }}>
                {statusRelacionamentoMap[empresa.statusRelacionamento]?.label ?? '—'}
              </span>
            </div>
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
                { label: 'Profissionais', value: profissionaisLocal.length },
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Profissionais ({profissionaisFiltrados.length}/{profissionaisLocal.length})
            </h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={profBusca}
                onChange={(e) => setProfBusca(e.target.value)}
                placeholder="Buscar por nome ou cargo…"
                style={{ ...S, width: 220, padding: '7px 12px', fontSize: 13 }}
              />
              <Button variant="primary" onPress={() => { setNovoProfForm(EMPTY_PROF); setNovoProfInfosAbertas(false); setModalNovoProf(true) }}>
                + Novo Profissional
              </Button>
            </div>
          </div>
          {profissionaisLocal.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: 32 }}>
              Nenhum profissional cadastrado.
            </p>
          ) : profissionaisFiltrados.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: 32 }}>
              Nenhum resultado para "{profBusca}".
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {(['Nome', 'Cargo'] as const).map((h) => {
                    const field = h === 'Nome' ? 'nome' : 'cargo'
                    const active = profSort.field === field
                    return (
                      <th
                        key={h}
                        scope="col"
                        onClick={() => toggleSort(field)}
                        style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: active ? 'var(--color-brand-primary)' : 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                      >
                        {h} {active ? (profSort.dir === 'asc' ? '↑' : '↓') : ''}
                      </th>
                    )
                  })}
                  {['E-mail', 'Telefone', 'Status'].map((h) => (
                    <th key={h} scope="col" style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profissionaisFiltrados.map((p) => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                    onClick={() => { setProfSelecionado(p); setProfModoEdicao(false) }}
                  >
                    <td style={{ padding: '12px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {p.parentId && <span style={{ color: 'var(--color-text-muted)', marginRight: 6 }}>↳</span>}
                      {p.nome}
                    </td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{p.cargo}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, color: 'var(--color-brand-accent)' }}>{p.email}</span>
                        {p.email && (
                          <button aria-label={`Copiar e-mail de ${p.nome}`} onClick={() => copyToClipboard(p.email!, `email-${p.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, color: copied === `email-${p.id}` ? 'var(--color-success)' : 'var(--color-text-muted)', fontSize: 12 }} title="Copiar e-mail">
                            {copied === `email-${p.id}` ? '✓' : '⎘'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{p.telefone}</span>
                        {p.telefone && (
                          <button aria-label={`Copiar telefone de ${p.nome}`} onClick={() => copyToClipboard(p.telefone!, `tel-${p.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, color: copied === `tel-${p.id}` ? 'var(--color-success)' : 'var(--color-text-muted)', fontSize: 12 }} title="Copiar telefone">
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
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Histórico de Interações ({interacoesFiltradas.length}/{interacoesLocal.length})
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
          {/* Filtros */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ ...S, width: 'auto', fontSize: 12, padding: '5px 10px', borderColor: filtroTipo ? 'var(--color-brand-primary)' : 'var(--color-border)' }}>
              <option value="">Todos os tipos</option>
              {Object.entries(tipoInteracaoMap).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
            <select value={filtroEfetividade} onChange={(e) => setFiltroEfetividade(e.target.value)} style={{ ...S, width: 'auto', fontSize: 12, padding: '5px 10px', borderColor: filtroEfetividade ? 'var(--color-brand-primary)' : 'var(--color-border)' }}>
              <option value="">Efetividade</option>
              <option value="efetivo">Efetivo</option>
              <option value="nao_efetivo">Não Efetivo</option>
            </select>
            <select value={filtroProduto} onChange={(e) => setFiltroProduto(e.target.value)} style={{ ...S, width: 'auto', fontSize: 12, padding: '5px 10px', borderColor: filtroProduto ? 'var(--color-brand-primary)' : 'var(--color-border)' }}>
              <option value="">Todos os produtos</option>
              {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <select value={filtroUsuario} onChange={(e) => setFiltroUsuario(e.target.value)} style={{ ...S, width: 'auto', fontSize: 12, padding: '5px 10px', borderColor: filtroUsuario ? 'var(--color-brand-primary)' : 'var(--color-border)' }}>
              <option value="">Todos os responsáveis</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
            {filtrosAtivos > 0 && (
              <button onClick={limparFiltros} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-danger)', padding: '5px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                ✕ Limpar {filtrosAtivos} filtro{filtrosAtivos > 1 ? 's' : ''}
              </button>
            )}
          </div>

          {interacoesLocal.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: 32 }}>
              Nenhuma interação registrada.
            </p>
          ) : interacoesFiltradas.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: 32 }}>
              Nenhuma interação com os filtros selecionados.
            </p>
          ) : (
            <div aria-live="polite" aria-label="Histórico de interações" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {interacoesFiltradas.map((interacao) => (
                <div
                  key={interacao.id}
                  onClick={() => setInteracaoSelecionada(interacao)}
                  style={{
                    padding: 16,
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `3px solid ${interacao.efetividade === 'efetivo' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                    cursor: 'pointer',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-muted)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
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
                      <Badge variant="neutral">{tipoInteracaoMap[interacao.tipo]?.icon} {tipoInteracaoMap[interacao.tipo]?.label}</Badge>
                      <Badge variant={interacao.efetividade === 'efetivo' ? 'active' : 'danger'}>
                        {interacao.efetividade === 'efetivo' ? 'Efetivo' : 'Não Efetivo'}
                      </Badge>
                      {interacao.isLead && <Badge variant="brand">Lead</Badge>}
                    </div>
                  </div>
                  {interacao.descricao && (
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{interacao.descricao}</p>
                  )}
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
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Contratos ({contratosLocal.length})
            </h3>
            <Button variant="primary" onPress={() => { setContratoStep(0); setModalContrato(true) }}>
              + Novo Contrato
            </Button>
          </div>
          {contratosLocal.length === 0 ? (
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
                {contratosLocal.map((contrato) => (
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

      {/* Modal Novo Contrato */}
      {modalContrato && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setModalContrato(false)}>
          <div style={{ background: 'var(--color-bg-white)', borderRadius: 16, width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding: '20px 24px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Novo Contrato</h2>
                <button onClick={() => setModalContrato(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--color-text-muted)', lineHeight: 1 }}>✕</button>
              </div>
              {/* Steps */}
              <div style={{ display: 'flex', gap: 0 }}>
                {['Produtos', 'Valores e Datas', 'Status'].map((step, i) => (
                  <div key={step} style={{ flex: 1, textAlign: 'center', paddingBottom: 10, fontSize: 13, fontWeight: contratoStep === i ? 700 : 500,
                    color: contratoStep === i ? 'var(--color-brand-primary)' : contratoStep > i ? 'var(--color-success)' : 'var(--color-text-muted)',
                    borderBottom: `2px solid ${contratoStep === i ? 'var(--color-brand-primary)' : contratoStep > i ? 'var(--color-success)' : 'var(--color-border)'}` }}>
                    {contratoStep > i ? '✓ ' : ''}{step}
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', minHeight: 200 }}>

              {/* Step 0 — Produtos */}
              {contratoStep === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
                    Selecione todos os produtos antes de preencher os dados. Adicionar ou remover os produtos vai limpar os dados abaixo.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {produtos.map((p) => {
                      const sel = contratoForm.produtos.includes(p.id)
                      return (
                        <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: `1px solid ${sel ? 'var(--color-brand-primary)' : 'var(--color-border)'}`, borderRadius: 10, cursor: 'pointer', background: sel ? 'rgba(29,78,216,0.05)' : 'transparent', transition: 'all 0.12s' }}>
                          <input type="checkbox" checked={sel} onChange={() => {
                            setCF('valorTotal', '')
                            setCF('valorMedioMensal', '')
                            toggleProduto(p.id)
                          }} style={{ width: 16, height: 16, accentColor: 'var(--color-brand-primary)', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.nome}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{p.categoria}</div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                  {contratoForm.produtos.length === 0 && (
                    <p style={{ fontSize: 12, color: 'var(--color-danger)', margin: 0 }}>Selecione pelo menos um produto.</p>
                  )}
                </div>
              )}

              {/* Step 1 — Valores e Datas */}
              {contratoStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Field label="Valor Total (R$)" htmlFor="c-valor-total">
                      <input id="c-valor-total" className="yeb-input" style={S} type="number" min="0" placeholder="0,00" value={contratoForm.valorTotal} onChange={(e) => setCF('valorTotal', e.target.value)} />
                    </Field>
                    <Field label="Valor Médio Mensal (R$)" htmlFor="c-valor-mensal">
                      <input id="c-valor-mensal" className="yeb-input" style={S} type="number" min="0" placeholder="0,00" value={contratoForm.valorMedioMensal} onChange={(e) => setCF('valorMedioMensal', e.target.value)} />
                    </Field>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Field label="Data de Início" required htmlFor="c-inicio">
                      <input id="c-inicio" aria-required="true" className="yeb-input" style={S} type="date" value={contratoForm.dataInicio} onChange={(e) => setCF('dataInicio', e.target.value)} />
                    </Field>
                    <Field label="Data de Vencimento" required htmlFor="c-vencimento">
                      <input id="c-vencimento" aria-required="true" className="yeb-input" style={S} type="date" value={contratoForm.dataVencimento} onChange={(e) => setCF('dataVencimento', e.target.value)} />
                    </Field>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                    Produtos selecionados: <strong>{contratoForm.produtos.map((pid) => getProduto(pid)?.nome).join(', ')}</strong>
                  </p>
                </div>
              )}

              {/* Step 2 — Status */}
              {contratoStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Field label="Status do Contrato" required htmlFor="c-status">
                      <select id="c-status" aria-required="true" className="yeb-input" style={S} value={contratoForm.status} onChange={(e) => setCF('status', e.target.value)}>
                        <option value="ativo">Ativo</option>
                        <option value="vencendo">Vencendo</option>
                        <option value="vencido">Vencido</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </Field>
                    <Field label="Regularização" required htmlFor="c-reg">
                      <select id="c-reg" aria-required="true" className="yeb-input" style={S} value={contratoForm.regularizacao} onChange={(e) => setCF('regularizacao', e.target.value)}>
                        <option value="regular">Regular</option>
                        <option value="pendente">Pendente</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Responsável" htmlFor="c-responsavel">
                    <select id="c-responsavel" className="yeb-input" style={S} value={contratoForm.criadoPor} onChange={(e) => setCF('criadoPor', Number(e.target.value))}>
                      {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                    </select>
                  </Field>
                  {/* Resumo */}
                  <div style={{ background: 'var(--color-bg-muted)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div><strong>Produtos:</strong> {contratoForm.produtos.map((pid) => getProduto(pid)?.nome).join(', ')}</div>
                    <div><strong>Valor Total:</strong> {Number(contratoForm.valorTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                    <div><strong>Início → Vencimento:</strong> {contratoForm.dataInicio} → {contratoForm.dataVencimento}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <Button variant="ghost" onPress={() => setModalContrato(false)}>Cancelar</Button>
              <div style={{ display: 'flex', gap: 10 }}>
                {contratoStep > 0 && (
                  <Button variant="outline" onPress={() => setContratoStep((s) => s - 1)}>Anterior</Button>
                )}
                {contratoStep < 2 ? (
                  <Button variant="primary"
                    isDisabled={contratoStep === 0 && contratoForm.produtos.length === 0}
                    onPress={() => setContratoStep((s) => s + 1)}>
                    Próximo
                  </Button>
                ) : (
                  <Button variant="primary"
                    isDisabled={!contratoForm.dataInicio || !contratoForm.dataVencimento}
                    onPress={handleSaveContrato}>
                    Finalizar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualização/Edição de Profissional */}
      {profSelecionado && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => { setProfSelecionado(null); setProfModoEdicao(false) }}
        >
          <div
            style={{ background: 'var(--color-bg-white)', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.20)', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>
                  {profModoEdicao ? 'Editar Profissional' : profSelecionado.nome}
                </h2>
                {!profModoEdicao && (
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{profSelecionado.cargo}</span>
                )}
              </div>
              <button onClick={() => { setProfSelecionado(null); setProfModoEdicao(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'var(--color-text-muted)', fontSize: 16, flexShrink: 0 }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {!profModoEdicao ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'E-mail', value: profSelecionado.email },
                      { label: 'Telefone', value: profSelecionado.telefone },
                      { label: 'LinkedIn', value: profSelecionado.linkedin },
                      { label: 'Superior', value: profissionaisLocal.find((p) => p.id === profSelecionado.parentId)?.nome },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: 'var(--color-bg-muted)', borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 500 }}>{value || '—'}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Status:</span>
                    <Badge variant={profSelecionado.ativo ? 'active' : 'inactive'}>{profSelecionado.ativo ? 'Ativo' : 'Inativo'}</Badge>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Field label="Nome" required htmlFor="pe-nome">
                      <input id="pe-nome" style={S} autoFocus value={profEditForm.nome} onChange={(e) => setProfEditForm((f) => ({ ...f, nome: e.target.value }))} />
                    </Field>
                    <Field label="Cargo" required htmlFor="pe-cargo">
                      <input id="pe-cargo" style={S} value={profEditForm.cargo} onChange={(e) => setProfEditForm((f) => ({ ...f, cargo: e.target.value }))} />
                    </Field>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Field label="E-mail" htmlFor="pe-email">
                      <input id="pe-email" type="email" style={S} value={profEditForm.email} onChange={(e) => setProfEditForm((f) => ({ ...f, email: e.target.value }))} />
                    </Field>
                    <Field label="Telefone" htmlFor="pe-tel">
                      <input id="pe-tel" type="tel" style={S} value={profEditForm.telefone} onChange={(e) => setProfEditForm((f) => ({ ...f, telefone: e.target.value }))} />
                    </Field>
                  </div>
                  <Field label="LinkedIn" htmlFor="pe-linkedin">
                    <input id="pe-linkedin" style={S} placeholder="linkedin.com/in/..." value={profEditForm.linkedin} onChange={(e) => setProfEditForm((f) => ({ ...f, linkedin: e.target.value }))} />
                  </Field>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Field label="Superior hierárquico" htmlFor="pe-superior">
                      <select id="pe-superior" style={S} value={profEditForm.parentId ?? ''} onChange={(e) => setProfEditForm((f) => ({ ...f, parentId: e.target.value ? Number(e.target.value) : undefined }))}>
                        <option value="">Nenhum</option>
                        {profissionaisLocal.filter((p) => p.id !== profSelecionado.id).map((p) => (
                          <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Status" htmlFor="pe-status">
                      <select id="pe-status" style={S} value={profEditForm.ativo ? 'ativo' : 'inativo'} onChange={(e) => setProfEditForm((f) => ({ ...f, ativo: e.target.value === 'ativo' }))}>
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 24px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {profModoEdicao ? (
                <>
                  <Button variant="ghost" onPress={() => setProfModoEdicao(false)}>Cancelar</Button>
                  <Button variant="primary" isDisabled={!profEditForm.nome || !profEditForm.cargo} onPress={handleSaveProfEdit}>Salvar alterações</Button>
                </>
              ) : (
                <>
                  <button onClick={() => { setProfSelecionado(null) }} style={{ padding: '8px 20px', background: 'var(--color-bg-muted)', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--color-text-secondary)' }}>Fechar</button>
                  <Button variant="outline" onPress={() => { setProfEditForm({ nome: profSelecionado.nome, cargo: profSelecionado.cargo, email: profSelecionado.email || '', telefone: profSelecionado.telefone || '', linkedin: profSelecionado.linkedin || '', parentId: profSelecionado.parentId, ativo: profSelecionado.ativo }); setProfModoEdicao(true) }}>Editar</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Profissional */}
      {modalNovoProf && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setModalNovoProf(false)}
        >
          <div
            style={{ background: 'var(--color-bg-white)', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.20)', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Novo Profissional</h2>
              <button onClick={() => setModalNovoProf(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'var(--color-text-muted)', fontSize: 16 }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Nome" required htmlFor="np-nome">
                  <input id="np-nome" style={S} autoFocus placeholder="Nome completo" value={novoProfForm.nome} onChange={(e) => setNovoProfForm((f) => ({ ...f, nome: e.target.value }))} />
                </Field>
                <Field label="Cargo" required htmlFor="np-cargo">
                  <input id="np-cargo" style={S} placeholder="Ex: Diretor de Suprimentos" value={novoProfForm.cargo} onChange={(e) => setNovoProfForm((f) => ({ ...f, cargo: e.target.value }))} />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="E-mail" htmlFor="np-email">
                  <input id="np-email" type="email" style={S} placeholder="email@empresa.com.br" value={novoProfForm.email} onChange={(e) => setNovoProfForm((f) => ({ ...f, email: e.target.value }))} />
                </Field>
                <Field label="Telefone" htmlFor="np-tel">
                  <input id="np-tel" type="tel" style={S} placeholder="(00) 00000-0000" value={novoProfForm.telefone} onChange={(e) => setNovoProfForm((f) => ({ ...f, telefone: e.target.value }))} />
                </Field>
              </div>

              {/* Informações adicionais — colapsável */}
              <button
                type="button"
                onClick={() => setNovoProfInfosAbertas((v) => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-brand-primary)', fontWeight: 500, padding: '4px 0', alignSelf: 'flex-start' }}
              >
                <span style={{ fontSize: 10, transition: 'transform 0.2s', display: 'inline-block', transform: novoProfInfosAbertas ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                Informações adicionais
              </button>

              {novoProfInfosAbertas && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 2 }}>
                  <Field label="LinkedIn" htmlFor="np-linkedin">
                    <input id="np-linkedin" style={S} placeholder="linkedin.com/in/..." value={novoProfForm.linkedin} onChange={(e) => setNovoProfForm((f) => ({ ...f, linkedin: e.target.value }))} />
                  </Field>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Field label="Superior hierárquico" htmlFor="np-superior">
                      <select id="np-superior" style={S} value={novoProfForm.parentId ?? ''} onChange={(e) => setNovoProfForm((f) => ({ ...f, parentId: e.target.value ? Number(e.target.value) : undefined }))}>
                        <option value="">Nenhum</option>
                        {profissionaisLocal.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                      </select>
                    </Field>
                    <Field label="Status" htmlFor="np-status">
                      <select id="np-status" style={S} value={novoProfForm.ativo ? 'ativo' : 'inativo'} onChange={(e) => setNovoProfForm((f) => ({ ...f, ativo: e.target.value === 'ativo' }))}>
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setModalNovoProf(false)} style={{ padding: '8px 20px', background: 'var(--color-bg-muted)', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--color-text-secondary)' }}>Cancelar</button>
              <Button variant="primary" isDisabled={!novoProfForm.nome || !novoProfForm.cargo} onPress={handleSaveNovoProfissional}>
                Cadastrar Profissional
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Leitura de Interação */}
      {interacaoSelecionada && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setInteracaoSelecionada(null)}
        >
          <div
            style={{ background: 'var(--color-bg-white)', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.20)', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                {interacaoSelecionada.titulo && (
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>{interacaoSelecionada.titulo}</h2>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Badge variant="neutral">{tipoInteracaoMap[interacaoSelecionada.tipo]?.icon} {tipoInteracaoMap[interacaoSelecionada.tipo]?.label}</Badge>
                  <Badge variant={interacaoSelecionada.efetividade === 'efetivo' ? 'active' : 'danger'}>
                    {interacaoSelecionada.efetividade === 'efetivo' ? 'Efetivo' : 'Não Efetivo'}
                  </Badge>
                  {interacaoSelecionada.isLead && <Badge variant="brand">Lead</Badge>}
                </div>
              </div>
              <button onClick={() => setInteracaoSelecionada(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'var(--color-text-muted)', display: 'flex', flexShrink: 0 }}>
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Data e Hora', value: new Date(interacaoSelecionada.dataHora).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                  { label: 'Responsável', value: getUsuario(interacaoSelecionada.usuarioId)?.nome ?? '—' },
                  { label: 'Produto', value: getProduto(interacaoSelecionada.produtoId)?.nome ?? '—' },
                  { label: 'Linha Comercial', value: interacaoSelecionada.linhaComercial },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--color-bg-muted)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Descrição */}
              {interacaoSelecionada.descricao ? (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Descrição</div>
                  <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7, margin: 0 }}>{interacaoSelecionada.descricao}</p>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sem descrição registrada.</p>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{tempoRelativo(interacaoSelecionada.dataHora)}</span>
              <button onClick={() => setInteracaoSelecionada(null)} style={{ padding: '8px 20px', background: 'var(--color-bg-muted)', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--color-text-secondary)' }}>
                Fechar
              </button>
            </div>
          </div>
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

                <Field label="Título" htmlFor="interacao-titulo">
                  <input id="interacao-titulo" className="yeb-input" style={S} placeholder="Ex: Reunião de apresentação (opcional)" value={formInteracao.titulo} onChange={(e) => setFI('titulo', e.target.value)} autoFocus />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Tipo" required htmlFor="interacao-tipo">
                    <select id="interacao-tipo" aria-required="true" className="yeb-input" style={S} value={formInteracao.tipo} onChange={(e) => setFI('tipo', e.target.value)}>
                      {Object.entries(tipoInteracaoMap).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
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
                    style={{ ...S, resize: 'none', minHeight: 80, maxHeight: 400, overflowY: 'auto' }}
                    placeholder="Descreva o que aconteceu nessa interação…"
                    value={formInteracao.descricao}
                    maxLength={DESCRICAO_MAX}
                    onChange={(e) => {
                      setFI('descricao', e.target.value)
                      const el = e.target
                      el.style.height = 'auto'
                      el.style.height = Math.min(el.scrollHeight, 400) + 'px'
                    }}
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
                  <Button variant="primary" onPress={handleSaveInteracao} isDisabled={!formInteracao.dataHora}>
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
