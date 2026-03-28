// ─── Entidades principais ───────────────────────────────────────────

export type PipelineStage = 'prospeccao' | 'qualificacao' | 'proposta' | 'negociacao' | 'fechado'
export type UserRole = 'admin' | 'gestor' | 'vendedor'
export type ContractStatus = 'ativo' | 'vencendo' | 'vencido' | 'cancelado'
export type RegularizacaoStatus = 'regular' | 'pendente'
export type Prioridade = 'Alta' | 'Media' | 'Baixa'
export type Efetividade = 'efetivo' | 'nao_efetivo'
export type TipoInteracao =
  | 'qualificacao_bd'
  | 'tentativa_agendamento'
  | 'proposta_enviada'
  | 'reuniao'
  | 'fechamento'

export interface Segmento {
  id: number
  nome: string
}

export interface Produto {
  id: number
  nome: string
  categoria: string
}

export interface Usuario {
  id: number
  nome: string
  email: string
  cargo: string
  perfil: UserRole
  ativo: boolean
}

export interface Empresa {
  id: number
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  segmentoId: number
  tipo: 'matriz' | 'filial'
  cnpjMatriz?: string
  pais: string
  cep?: string
  logradouro?: string
  bairro?: string
  cidade?: string
  uf?: string
  telefone?: string
  email?: string
  empresaAlvo: boolean
  favorita: boolean
  pipeline: PipelineStage
  usuarioId: number
  createdAt: string
}

export interface Profissional {
  id: number
  empresaId: number
  nome: string
  cargo: string
  email: string
  telefone: string
  linkedin?: string
  parentId?: number
  ativo: boolean
}

export interface Interacao {
  id: number
  empresaId: number
  usuarioId: number
  titulo: string
  descricao: string
  tipo: TipoInteracao
  efetividade: Efetividade
  isLead: boolean
  produtoId: number
  linhaComercial: 'Vendas' | 'Gestão'
  dataHora: string
}

export interface Contrato {
  id: number
  numero: number
  empresaId: number
  status: ContractStatus
  regularizacao: RegularizacaoStatus
  valorTotal: number
  valorMedioMensal: number
  produtos: number[]
  dataInicio: string
  dataVencimento: string
  criadoPor: number
}

export interface Atividade {
  id: number
  usuarioId: number
  titulo: string
  acao: string
  etapas?: string[]
  prioridade: Prioridade
  inicio: string
  fim: string
  prazo: string
}

export interface FiltroSalvo {
  id: number
  nome: string
  empresa?: string
  atuacaoComercial?: string
  profissional?: string
}
