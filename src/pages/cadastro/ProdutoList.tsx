import { useState } from 'react'
import { Button, Modal, useOverlayState } from '@heroui/react'
import { produtos as initialProdutos } from '../../data/produtos'
import { PageHeader, ConfirmDialog } from '../../components/ui'
import type { Produto } from '../../types'

const CATEGORIAS = ['Soluções', 'Plataforma de Inteligência de Mercado']

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  fontSize: 14,
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-bg-white)',
  color: 'var(--color-text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
  marginBottom: 4,
  display: 'block',
}

const EMPTY_FORM = { nome: '', categoria: CATEGORIAS[0] }

export default function ProdutoList() {
  const [data, setData] = useState(initialProdutos)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState<Produto | null>(null)
  const [selected, setSelected] = useState<Produto | null>(null)
  const [deleting, setDeleting] = useState(false)

  const modalState = useOverlayState()
  const deleteState = useOverlayState()

  const handleOpenNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    modalState.open()
  }

  const handleOpenEdit = (produto: Produto) => {
    setEditing(produto)
    setForm({ nome: produto.nome, categoria: produto.categoria })
    modalState.open()
  }

  const handleSave = () => {
    if (editing) {
      setData(data.map((p) => (p.id === editing.id ? { ...p, ...form } : p)))
    } else {
      setData([...data, { id: Date.now(), ...form }])
    }
    modalState.close()
  }

  const handleDelete = () => {
    if (!selected) return
    setDeleting(true)
    setTimeout(() => {
      setData(data.filter((p) => p.id !== selected.id))
      setDeleting(false)
      deleteState.close()
      setSelected(null)
    }, 400)
  }

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle={`${data.length} produtos cadastrados`}
        actions={
          <Button variant="primary" onPress={handleOpenNew}>+ Novo Produto</Button>
        }
      />

      <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Produto', 'Categoria', ''].map((h) => (
                <th key={h} scope="col" style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((produto) => (
              <tr
                key={produto.id}
                style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{produto.nome}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{produto.categoria}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onPress={() => handleOpenEdit(produto)} style={{ fontSize: 13 }}>Editar</Button>
                    <Button
                      variant="ghost"
                      onPress={() => { setSelected(produto); deleteState.open() }}
                      style={{ fontSize: 13, color: 'var(--color-danger)' }}
                    >
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={modalState.isOpen} onOpenChange={modalState.setOpen}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>{editing ? 'Editar Produto' : 'Novo Produto'}</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div>
                    <label htmlFor="produto-nome" style={labelStyle}>Nome <span aria-hidden="true">*</span><span className="sr-only">(obrigatório)</span></label>
                    <input id="produto-nome" aria-required="true" style={inputStyle} value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome do produto" />
                  </div>
                  <div>
                    <label htmlFor="produto-categoria" style={labelStyle}>Categoria <span aria-hidden="true">*</span><span className="sr-only">(obrigatório)</span></label>
                    <select id="produto-categoria" aria-required="true" style={inputStyle} value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}>
                      {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline" onPress={modalState.close}>Cancelar</Button>
                <Button variant="primary" onPress={handleSave} isDisabled={!form.nome}>
                  {editing ? 'Salvar' : 'Cadastrar'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <ConfirmDialog
        state={deleteState}
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir "${selected?.nome}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
