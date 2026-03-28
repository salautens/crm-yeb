import type { Segmento } from '../types'

export const segmentos: Segmento[] = [
  { id: 1, nome: 'Usinas' },
  { id: 2, nome: 'SOMA' },
  { id: 3, nome: 'Florestas' },
  { id: 4, nome: 'NutriV' },
  { id: 5, nome: 'Cooperativas' },
  { id: 6, nome: 'Citros' },
  { id: 7, nome: 'Distribuição e Revenda' },
  { id: 8, nome: 'FCMs e IBs' },
  { id: 9, nome: 'Fazendeiros' },
  { id: 10, nome: 'Indústria' },
  { id: 11, nome: 'Construção Civil' },
  { id: 12, nome: 'Outros' },
]

export const getSegmento = (id: number) => segmentos.find((s) => s.id === id)
