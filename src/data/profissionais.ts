import type { Profissional } from '../types'

export const profissionais: Profissional[] = [
  { id: 1, empresaId: 1, nome: 'Carlos Mendes', cargo: 'Diretor Agrícola', email: 'carlos@agromax.com.br', telefone: '(19) 99999-0001', linkedin: 'linkedin.com/in/carlosmendes', ativo: true },
  { id: 2, empresaId: 1, nome: 'Ana Paula Lima', cargo: 'Diretor de Suprimentos', email: 'ana@agromax.com.br', telefone: '(19) 99999-0002', ativo: true },
  { id: 3, empresaId: 1, nome: 'Marcos Oliveira', cargo: 'Comprador', email: 'marcos@agromax.com.br', telefone: '(19) 99999-0003', parentId: 2, ativo: true },
  { id: 4, empresaId: 2, nome: 'Joana Torres', cargo: 'Presidente', email: 'joana@coopnorte.com.br', telefone: '(65) 99999-0001', ativo: true },
  { id: 5, empresaId: 2, nome: 'Pedro Ramos', cargo: 'Gerente de Suprimentos', email: 'pedro@coopnorte.com.br', telefone: '(65) 99999-0002', parentId: 4, ativo: true },
  { id: 6, empresaId: 3, nome: 'Sandra Figueiredo', cargo: 'Diretor Geral', email: 'sandra@campoverde.com.br', telefone: '(43) 99999-0001', linkedin: 'linkedin.com/in/sandrafig', ativo: true },
  { id: 7, empresaId: 3, nome: 'Ricardo Costa', cargo: 'Coordenador de Suprimentos', email: 'ricardo@campoverde.com.br', telefone: '(43) 99999-0002', parentId: 6, ativo: false },
  { id: 8, empresaId: 4, nome: 'Luiz Fazendeiro', cargo: 'Presidente', email: 'luiz@santaclara.com.br', telefone: '(64) 99999-0001', ativo: true },
  { id: 9, empresaId: 5, nome: 'Márcia Queiroz', cargo: 'Diretor Industrial', email: 'marcia@iqp.com.br', telefone: '(11) 99999-0001', ativo: true },
  { id: 10, empresaId: 10, nome: 'Antônio Cana', cargo: 'Diretor Agrícola', email: 'antonio@boaesperanca.com.br', telefone: '(16) 99999-0001', linkedin: 'linkedin.com/in/antoniocana', ativo: true },
]

export const getProfissionaisByEmpresa = (empresaId: number) =>
  profissionais.filter((p) => p.empresaId === empresaId)
