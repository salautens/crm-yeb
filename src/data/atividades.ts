import type { Atividade } from '../types'

export const atividades: Atividade[] = [
  { id: 1, usuarioId: 3, titulo: 'Visita Agromax - apresentar NutriV', acao: 'Apresentar linha NutriV ao diretor agrícola, levar amostras', etapas: ['Confirmar reunião no dia anterior', 'Preparar material de apresentação', 'Enviar follow-up até 48h depois'], prioridade: 'Alta', inicio: '2026-03-25T09:00:00', fim: '2026-03-25T11:00:00', prazo: '2026-03-25' },
  { id: 2, usuarioId: 3, titulo: 'Ligar para CoopNorte', acao: 'Follow-up da reunião de fevereiro, verificar interesse em Price Index', etapas: [], prioridade: 'Alta', inicio: '2026-03-25T14:00:00', fim: '2026-03-25T14:30:00', prazo: '2026-03-25' },
  { id: 3, usuarioId: 3, titulo: 'Enviar proposta Campo Verde', acao: 'Revisar e enviar proposta de Diesel Economics conforme solicitado', etapas: ['Revisar valores', 'Confirmar desconto com gestor'], prioridade: 'Alta', inicio: '2026-03-26T10:00:00', fim: '2026-03-26T11:00:00', prazo: '2026-03-26' },
  { id: 4, usuarioId: 3, titulo: 'Qualificar base Fazendeiros', acao: 'Ligar para 10 fazendeiros da lista exportada da Base de Dados', etapas: [], prioridade: 'Media', inicio: '2026-03-26T14:00:00', fim: '2026-03-26T17:00:00', prazo: '2026-03-28' },
  { id: 5, usuarioId: 3, titulo: 'Reunião de pipeline semanal', acao: 'Reunião com Fernanda para revisar pipeline e oportunidades', etapas: [], prioridade: 'Alta', inicio: '2026-03-27T09:00:00', fim: '2026-03-27T10:00:00', prazo: '2026-03-27' },
  { id: 6, usuarioId: 3, titulo: 'Atualizar CRM com interações da semana', acao: 'Registrar todas as interações realizadas nos últimos 3 dias', etapas: [], prioridade: 'Baixa', inicio: '2026-03-27T17:00:00', fim: '2026-03-27T17:30:00', prazo: '2026-03-27' },
  { id: 7, usuarioId: 3, titulo: 'Negociação Boa Esperança', acao: 'Call de negociação final para fechar contrato de GlobalFert', etapas: ['Preparar simulação de valores', 'Confirmar produtos incluídos'], prioridade: 'Alta', inicio: '2026-03-28T10:00:00', fim: '2026-03-28T11:30:00', prazo: '2026-03-28' },
  { id: 8, usuarioId: 3, titulo: 'Prospecção Indústria Química', acao: 'Pesquisar contatos da IQP e agendar primeira reunião', etapas: [], prioridade: 'Media', inicio: '2026-03-28T15:00:00', fim: '2026-03-28T16:00:00', prazo: '2026-03-31' },
]

export const addAtividade = (a: Atividade) => {
  atividades.push(a)
}

export const updateAtividade = (id: number, partial: Partial<Atividade>) => {
  const idx = atividades.findIndex((a) => a.id === id)
  if (idx !== -1) Object.assign(atividades[idx], partial)
}
