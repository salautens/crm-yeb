import type { Empresa } from '../types'

export let empresas: Empresa[] = [
  { id: 1, razaoSocial: 'Agromax Soluções S.A.', nomeFantasia: 'Agromax', cnpj: '12.345.678/0001-90', segmentoId: 1, tipo: 'matriz', pais: 'Brasil', cep: '13400-000', logradouro: 'Av. das Usinas, 100', bairro: 'Centro', cidade: 'Piracicaba', uf: 'SP', empresaAlvo: true, favorita: true, pipeline: 'proposta', usuarioId: 3, createdAt: '2026-01-10' },
  { id: 2, razaoSocial: 'Cooperativa Agrícola Norte Ltda', nomeFantasia: 'CoopNorte', cnpj: '98.765.432/0001-11', segmentoId: 5, tipo: 'matriz', pais: 'Brasil', cep: '78900-000', logradouro: 'Rua das Cooperativas, 200', bairro: 'Centro', cidade: 'Cuiabá', uf: 'MT', empresaAlvo: true, favorita: true, pipeline: 'qualificacao', usuarioId: 4, createdAt: '2026-01-15' },
  { id: 3, razaoSocial: 'Distribuidora Campo Verde Ltda', nomeFantasia: 'Campo Verde', cnpj: '11.222.333/0001-44', segmentoId: 7, tipo: 'matriz', pais: 'Brasil', cep: '86000-000', logradouro: 'Rua Comercial, 500', bairro: 'Jardim Europa', cidade: 'Londrina', uf: 'PR', empresaAlvo: false, favorita: true, pipeline: 'negociacao', usuarioId: 3, createdAt: '2026-01-20' },
  { id: 4, razaoSocial: 'Fazenda Santa Clara S.A.', nomeFantasia: 'Santa Clara', cnpj: '44.555.666/0001-77', segmentoId: 9, tipo: 'matriz', pais: 'Brasil', cep: '75800-000', logradouro: 'Rod. GO-030 Km 12', bairro: 'Zona Rural', cidade: 'Jataí', uf: 'GO', empresaAlvo: true, favorita: false, pipeline: 'fechado', usuarioId: 5, createdAt: '2026-01-25' },
  { id: 5, razaoSocial: 'Indústria Química Paulista Ltda', nomeFantasia: 'IQP', cnpj: '55.666.777/0001-88', segmentoId: 10, tipo: 'matriz', pais: 'Brasil', cep: '09000-000', logradouro: 'Av. Industrial, 1200', bairro: 'Distrito Industrial', cidade: 'Santo André', uf: 'SP', empresaAlvo: false, favorita: false, pipeline: 'prospeccao', usuarioId: 6, createdAt: '2026-02-01' },
  { id: 6, razaoSocial: 'Grupo Citrus Brasil S.A.', nomeFantasia: 'Citrus Brasil', cnpj: '66.777.888/0001-99', segmentoId: 6, tipo: 'matriz', pais: 'Brasil', cep: '14800-000', logradouro: 'Rua dos Laranjais, 80', bairro: 'Centro', cidade: 'Araraquara', uf: 'SP', empresaAlvo: true, favorita: false, pipeline: 'qualificacao', usuarioId: 3, createdAt: '2026-02-05' },
  { id: 7, razaoSocial: 'Construtora Horizonte Ltda', nomeFantasia: 'Horizonte', cnpj: '77.888.999/0001-10', segmentoId: 11, tipo: 'matriz', pais: 'Brasil', cep: '30000-000', logradouro: 'Av. dos Construtores, 999', bairro: 'Bairro Industrial', cidade: 'Belo Horizonte', uf: 'MG', empresaAlvo: false, favorita: false, pipeline: 'proposta', usuarioId: 4, createdAt: '2026-02-10' },
  { id: 8, razaoSocial: 'Florestal Verde Pinus S.A.', nomeFantasia: 'Verde Pinus', cnpj: '88.999.000/0001-21', segmentoId: 3, tipo: 'matriz', pais: 'Brasil', cep: '84000-000', logradouro: 'Estrada das Florestas, 300', bairro: 'Zona Rural', cidade: 'Ponta Grossa', uf: 'PR', empresaAlvo: true, favorita: false, pipeline: 'fechado', usuarioId: 5, createdAt: '2026-02-12' },
  { id: 9, razaoSocial: 'Revenda Agro Sul Ltda', nomeFantasia: 'Agro Sul', cnpj: '99.000.111/0001-32', segmentoId: 7, tipo: 'filial', cnpjMatriz: '99.000.111/0001-00', pais: 'Brasil', cep: '96800-000', logradouro: 'Rua das Vendas, 45', bairro: 'Centro', cidade: 'Bagé', uf: 'RS', empresaAlvo: false, favorita: false, pipeline: 'prospeccao', usuarioId: 6, createdAt: '2026-02-15' },
  { id: 10, razaoSocial: 'Usina Boa Esperança S.A.', nomeFantasia: 'Boa Esperança', cnpj: '10.111.222/0001-43', segmentoId: 1, tipo: 'matriz', pais: 'Brasil', cep: '14600-000', logradouro: 'Rod. SP-255 Km 5', bairro: 'Zona Rural', cidade: 'Jaboticabal', uf: 'SP', empresaAlvo: true, favorita: true, pipeline: 'negociacao', usuarioId: 3, createdAt: '2026-02-18' },
  { id: 11, razaoSocial: 'Fertibrasil Agro Ltda', nomeFantasia: 'Fertibrasil', cnpj: '11.222.333/0002-55', segmentoId: 4, tipo: 'matriz', pais: 'Brasil', cep: '79800-000', logradouro: 'Av. Nutrição, 77', bairro: 'Setor Sul', cidade: 'Dourados', uf: 'MS', empresaAlvo: false, favorita: false, pipeline: 'qualificacao', usuarioId: 4, createdAt: '2026-02-20' },
  { id: 12, razaoSocial: 'FCM Agroquímica Norte S.A.', nomeFantasia: 'FCM Norte', cnpj: '12.333.444/0001-66', segmentoId: 8, tipo: 'matriz', pais: 'Brasil', cep: '69000-000', logradouro: 'Rua da Química, 150', bairro: 'Distrito Industrial', cidade: 'Manaus', uf: 'AM', empresaAlvo: false, favorita: false, pipeline: 'proposta', usuarioId: 5, createdAt: '2026-02-22' },
  { id: 13, razaoSocial: 'Agropecuária Cerrado Ltda', nomeFantasia: 'Cerrado', cnpj: '13.444.555/0001-77', segmentoId: 9, tipo: 'matriz', pais: 'Brasil', cep: '74000-000', logradouro: 'Fazenda Cerrado s/n', bairro: 'Zona Rural', cidade: 'Goiânia', uf: 'GO', empresaAlvo: true, favorita: false, pipeline: 'fechado', usuarioId: 3, createdAt: '2026-02-25' },
  { id: 14, razaoSocial: 'Cooperativa SOMA Sul Ltda', nomeFantasia: 'SOMA Sul', cnpj: '14.555.666/0001-88', segmentoId: 2, tipo: 'matriz', pais: 'Brasil', cep: '89800-000', logradouro: 'Rua SOMA, 25', bairro: 'Centro', cidade: 'Chapecó', uf: 'SC', empresaAlvo: true, favorita: false, pipeline: 'prospeccao', usuarioId: 6, createdAt: '2026-03-01' },
  { id: 15, razaoSocial: 'Global Indústria e Comércio S.A.', nomeFantasia: 'Global Ind', cnpj: '15.666.777/0001-99', segmentoId: 10, tipo: 'matriz', pais: 'Brasil', cep: '04000-000', logradouro: 'Av. Paulista, 2000', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP', empresaAlvo: false, favorita: false, pipeline: 'qualificacao', usuarioId: 4, createdAt: '2026-03-05' },
]

export const getEmpresa = (id: number) => empresas.find((e) => e.id === id)
export const getEmpresasFavoritas = () => empresas.filter((e) => e.favorita)

// Mutações locais (substituem o array em memória)
export const addEmpresa = (e: Empresa) => { empresas = [...empresas, e] }
export const updateEmpresa = (id: number, data: Partial<Empresa>) => {
  empresas = empresas.map((e) => (e.id === id ? { ...e, ...data } : e))
}
export const deleteEmpresa = (id: number) => {
  empresas = empresas.filter((e) => e.id !== id)
}
