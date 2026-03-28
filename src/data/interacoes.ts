import type { Interacao } from '../types'

export const interacoes: Interacao[] = [
  { id: 1, empresaId: 1, usuarioId: 3, titulo: 'Qualificação inicial', descricao: 'Validação dos dados da empresa na base', tipo: 'qualificacao_bd', efetividade: 'efetivo', isLead: false, produtoId: 1, linhaComercial: 'Vendas', dataHora: '2026-01-15T10:00:00' },
  { id: 2, empresaId: 1, usuarioId: 3, titulo: 'Tentativa de agendamento', descricao: 'Ligou para Diretor Agrícola, não atendeu', tipo: 'tentativa_agendamento', efetividade: 'nao_efetivo', isLead: false, produtoId: 1, linhaComercial: 'Vendas', dataHora: '2026-01-22T14:30:00' },
  { id: 3, empresaId: 1, usuarioId: 3, titulo: 'Reunião de apresentação', descricao: 'Carlos demonstrou interesse em GlobalKem e GlobalFert', tipo: 'reuniao', efetividade: 'efetivo', isLead: true, produtoId: 1, linhaComercial: 'Vendas', dataHora: '2026-02-05T09:00:00' },
  { id: 4, empresaId: 1, usuarioId: 3, titulo: 'Proposta enviada', descricao: 'Proposta de R$44.280 enviada para aprovação', tipo: 'proposta_enviada', efetividade: 'efetivo', isLead: true, produtoId: 1, linhaComercial: 'Vendas', dataHora: '2026-02-20T11:00:00' },
  { id: 5, empresaId: 2, usuarioId: 4, titulo: 'Qualificação de base', descricao: 'Dados da cooperativa atualizados', tipo: 'qualificacao_bd', efetividade: 'efetivo', isLead: false, produtoId: 5, linhaComercial: 'Gestão', dataHora: '2026-01-18T16:00:00' },
  { id: 6, empresaId: 2, usuarioId: 4, titulo: 'Reunião com presidente', descricao: 'Joana interessada em Price Index para gestão da cooperativa', tipo: 'reuniao', efetividade: 'efetivo', isLead: true, produtoId: 5, linhaComercial: 'Gestão', dataHora: '2026-02-10T10:00:00' },
  { id: 7, empresaId: 3, usuarioId: 3, titulo: 'Contato telefônico', descricao: 'Apresentação rápida do portfólio', tipo: 'tentativa_agendamento', efetividade: 'efetivo', isLead: false, produtoId: 2, linhaComercial: 'Vendas', dataHora: '2026-02-01T15:00:00' },
  { id: 8, empresaId: 10, usuarioId: 3, titulo: 'Visita à usina', descricao: 'Visita técnica com Antônio Cana, excelente receptividade', tipo: 'reuniao', efetividade: 'efetivo', isLead: true, produtoId: 3, linhaComercial: 'Vendas', dataHora: '2026-02-28T08:00:00' },
  { id: 9, empresaId: 10, usuarioId: 3, titulo: 'Negociação de contrato', descricao: 'Discutindo valores e produtos incluídos', tipo: 'proposta_enviada', efetividade: 'efetivo', isLead: true, produtoId: 3, linhaComercial: 'Vendas', dataHora: '2026-03-10T14:00:00' },
]

export const getInteracoesByEmpresa = (empresaId: number) =>
  interacoes.filter((i) => i.empresaId === empresaId)
