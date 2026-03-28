import type { Contrato } from '../types'

export const contratos: Contrato[] = [
  { id: 1, numero: 27, empresaId: 4, status: 'ativo', regularizacao: 'regular', valorTotal: 86400, valorMedioMensal: 7200, produtos: [1, 3], dataInicio: '2023-09-01', dataVencimento: '2027-09-01', criadoPor: 2 },
  { id: 2, numero: 28, empresaId: 8, status: 'ativo', regularizacao: 'regular', valorTotal: 44280, valorMedioMensal: 3690, produtos: [1, 2, 3, 4], dataInicio: '2024-03-04', dataVencimento: '2026-04-14', criadoPor: 2 },
  { id: 3, numero: 29, empresaId: 13, status: 'ativo', regularizacao: 'pendente', valorTotal: 36000, valorMedioMensal: 3000, produtos: [1], dataInicio: '2025-01-01', dataVencimento: '2026-04-27', criadoPor: 2 },
  { id: 4, numero: 30, empresaId: 4, status: 'ativo', regularizacao: 'regular', valorTotal: 120000, valorMedioMensal: 10000, produtos: [5], dataInicio: '2024-08-01', dataVencimento: '2036-07-31', criadoPor: 1 },
  { id: 5, numero: 42, empresaId: 10, status: 'vencendo', regularizacao: 'pendente', valorTotal: 52800, valorMedioMensal: 4400, produtos: [1, 3], dataInicio: '2025-04-01', dataVencimento: '2026-04-14', criadoPor: 3 },
]

export const getContratosByEmpresa = (empresaId: number) =>
  contratos.filter((c) => c.empresaId === empresaId)

export const getContratosByStatus = (status: string) =>
  contratos.filter((c) => c.status === status)
