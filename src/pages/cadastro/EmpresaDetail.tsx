import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@heroui/react'
import { getEmpresa } from '../../data/empresas'
import { segmentos } from '../../data/segmentos'
import { getUsuario } from '../../data/usuarios'
import { getProfissionaisByEmpresa } from '../../data/profissionais'
import { getInteracoesByEmpresa } from '../../data/interacoes'
import { getContratosByEmpresa } from '../../data/contratos'
import { getProduto } from '../../data/produtos'
import { Badge } from '../../components/ui/Badge'
import { ContractStatusBadge, RegularizacaoBadge, EmpresaAlvoBadge } from '../../components/ui/StatusBadge'
import type { PipelineStage, TipoInteracao } from '../../types'

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

export default function EmpresaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)

  const empresa = getEmpresa(Number(id))

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
  const interacoes = getInteracoesByEmpresa(empresa.id)
  const contratos = getContratosByEmpresa(empresa.id)
  const pipeline = pipelineMap[empresa.pipeline]

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
      <div style={{ borderBottom: '1px solid var(--color-border)', marginBottom: 24 }} className="flex gap-1">
        {TABS.map((tab, i) => (
          <button
            key={tab}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
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
                { label: 'Interações', value: interacoes.length },
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
        <div style={cardStyle}>
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
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
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
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--color-brand-accent)' }}>{p.email}</td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{p.telefone}</td>
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
        <div style={cardStyle}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Histórico de Interações ({interacoes.length})
          </h3>
          {interacoes.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: 32 }}>
              Nenhuma interação registrada.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {interacoes.map((interacao) => (
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
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {new Date(interacao.dataHora).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
        <div style={cardStyle}>
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
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
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
    </div>
  )
}
