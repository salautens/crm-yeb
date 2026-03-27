import { useState } from 'react'
import { Table, Pagination } from '@heroui/react'
import { StarIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

interface Empresa {
  id: number
  nome: string
  cnpj: string
  segmento: string
  empresaAlvo: string
  favorita: boolean
}

const empresasMock: Empresa[] = [
  { id: 1, nome: 'Tech Solutions Ltda', cnpj: '12.345.678/0001-90', segmento: 'Tecnologia', empresaAlvo: 'Enterprise', favorita: true },
  { id: 2, nome: 'Logística Rápida S.A.', cnpj: '98.765.432/0001-11', segmento: 'Logística', empresaAlvo: 'Mid-Market', favorita: true },
  { id: 3, nome: 'Construtora Norte', cnpj: '11.222.333/0001-44', segmento: 'Construção', empresaAlvo: 'Enterprise', favorita: true },
]

const PAGE_SIZE = 10

export default function Inicio() {
  const [page, setPage] = useState(1)
  const [empresas, setEmpresas] = useState<Empresa[]>(empresasMock)

  const totalPages = Math.max(1, Math.ceil(empresas.length / PAGE_SIZE))
  const paginated = empresas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleFavorita = (id: number) => {
    setEmpresas((prev) =>
      prev.map((e) => (e.id === id ? { ...e, favorita: !e.favorita } : e))
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Empresas favoritas
      </h2>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Empresas favoritas">
              <Table.Header>
                <Table.Column id="nome" isRowHeader>Empresa</Table.Column>
                <Table.Column id="cnpj">CNPJ</Table.Column>
                <Table.Column id="segmento">Segmento</Table.Column>
                <Table.Column id="empresaAlvo">Empresa alvo</Table.Column>
                <Table.Column id="acao">Ação</Table.Column>
              </Table.Header>
              <Table.Body
                renderEmptyState={() => (
                  <div className="text-center py-8 text-gray-400">
                    Nenhuma empresa favorita
                  </div>
                )}
              >
                {paginated.map((empresa) => (
                  <Table.Row key={empresa.id} id={String(empresa.id)}>
                    <Table.Cell>
                      <span className="font-medium text-gray-800">{empresa.nome}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-gray-500">{empresa.cnpj}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-gray-600">{empresa.segmento}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-gray-600">{empresa.empresaAlvo}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavorita(empresa.id)}
                          className="p-1.5 rounded hover:bg-gray-100"
                        >
                          {empresa.favorita ? (
                            <StarSolid className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <StarIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button className="p-1.5 rounded hover:bg-gray-100">
                          <EllipsisHorizontalIcon className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-end px-4 py-3 border-t border-gray-100">
          <Pagination>
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-disabled={page === 1}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                >
                  <Pagination.PreviousIcon />
                </Pagination.Previous>
              </Pagination.Item>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Pagination.Item key={p}>
                  <Pagination.Link
                    isActive={p === page}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Pagination.Link>
                </Pagination.Item>
              ))}
              <Pagination.Item>
                <Pagination.Next
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                >
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
