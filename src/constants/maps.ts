import type { PipelineStage, TipoInteracao, StatusRelacionamento, StatusProfissional } from '../types'

export const pipelineMap: Record<PipelineStage, { label: string; variant: 'neutral' | 'brand' | 'pending' | 'active' | 'danger' | 'inactive' }> = {
  prospeccao:        { label: 'Prospecção',       variant: 'neutral'   },
  qualificacao:      { label: 'Qualificação',      variant: 'brand'     },
  proposta_enviada:  { label: 'Proposta Enviada',  variant: 'pending'   },
  em_negociacao:     { label: 'Em Negociação',     variant: 'pending'   },
  proposta_aceita:   { label: 'Proposta Aceita',   variant: 'active'    },
  proposta_recusada: { label: 'Proposta Recusada', variant: 'danger'    },
  fechado:           { label: 'Fechado',           variant: 'inactive'  },
}

export const tipoInteracaoMap: Record<TipoInteracao, { label: string; icon: string }> = {
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

export const statusRelMap: Record<StatusRelacionamento, { label: string; color: string }> = {
  lead:          { label: 'Lead',          color: '#94A3B8' },
  prospect:      { label: 'Prospect',      color: '#3B82F6' },
  cliente_ativo: { label: 'Cliente Ativo', color: '#10B981' },
  ex_cliente:    { label: 'Ex-Cliente',    color: '#F59E0B' },
  parceiro:      { label: 'Parceiro',      color: '#8B5CF6' },
  nao_definido:  { label: 'Não Definido',  color: '#94A3B8' },
}

export const statusProfMap: Record<StatusProfissional, { label: string; variant: 'active' | 'inactive' | 'danger' | 'neutral' }> = {
  ativo:            { label: 'Ativo',            variant: 'active'   },
  desligado:        { label: 'Desligado',         variant: 'inactive' },
  saiu_da_empresa:  { label: 'Saiu da Empresa',   variant: 'danger'   },
  falecido:         { label: 'Falecido',          variant: 'neutral'  },
}
