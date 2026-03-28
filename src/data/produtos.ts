import type { Produto } from '../types'

export const produtos: Produto[] = [
  { id: 1, nome: 'GlobalKem', categoria: 'Soluções' },
  { id: 2, nome: 'Diesel Economics', categoria: 'Soluções' },
  { id: 3, nome: 'GlobalFert Agro', categoria: 'Soluções' },
  { id: 4, nome: 'GlobalCropProtection', categoria: 'Soluções' },
  { id: 5, nome: 'Price Index', categoria: 'Plataforma de Inteligência de Mercado' },
  { id: 6, nome: 'YEB', categoria: 'Plataforma de Inteligência de Mercado' },
]

export const getProduto = (id: number) => produtos.find((p) => p.id === id)
