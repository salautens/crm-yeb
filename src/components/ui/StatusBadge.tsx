import { Badge } from './Badge'
import type { ContractStatus, RegularizacaoStatus } from '../../types'

const contractMap: Record<ContractStatus, { label: string; variant: 'active' | 'pending' | 'danger' | 'inactive' }> = {
  ativo:     { label: 'Ativo', variant: 'active' },
  vencendo:  { label: 'Vencendo', variant: 'pending' },
  vencido:   { label: 'Vencido', variant: 'danger' },
  cancelado: { label: 'Cancelado', variant: 'inactive' },
}

const regularizacaoMap: Record<RegularizacaoStatus, { label: string; variant: 'active' | 'pending' }> = {
  regular:  { label: 'Regular', variant: 'active' },
  pendente: { label: 'Pendente', variant: 'pending' },
}

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const { label, variant } = contractMap[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function RegularizacaoBadge({ status }: { status: RegularizacaoStatus }) {
  const { label, variant } = regularizacaoMap[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function EmpresaAlvoBadge({ isAlvo }: { isAlvo: boolean }) {
  return (
    <Badge variant={isAlvo ? 'brand' : 'inactive'}>
      {isAlvo ? 'Sim' : 'Não'}
    </Badge>
  )
}
