import type { Usuario } from '../types'

export const usuarios: Usuario[] = [
  { id: 1, nome: 'Admin', email: 'admin@yeb.com.br', cargo: 'Administrador', perfil: 'admin', ativo: true },
  { id: 2, nome: 'Fernanda Gestora', email: 'fernanda@yeb.com.br', cargo: 'Gerente de Vendas', perfil: 'gestor', ativo: true },
  { id: 3, nome: 'Rafael Vendedor', email: 'rafael@yeb.com.br', cargo: 'Consultor Comercial', perfil: 'vendedor', ativo: true },
  { id: 4, nome: 'Gaby', email: 'gaby@yeb.com.br', cargo: 'Consultora Comercial', perfil: 'vendedor', ativo: true },
  { id: 5, nome: 'Laleska Silva', email: 'laleska@yeb.com.br', cargo: 'Consultora Comercial', perfil: 'vendedor', ativo: true },
  { id: 6, nome: 'Lucas SDR', email: 'lucas@yeb.com.br', cargo: 'Analista de Inteligência Comercial', perfil: 'vendedor', ativo: true },
]

export const getUsuario = (id: number) => usuarios.find((u) => u.id === id)
