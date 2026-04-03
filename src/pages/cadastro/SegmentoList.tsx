import { useState } from 'react'
import { Button, Modal, useOverlayState } from '@heroui/react'
import { segmentos as initialSegmentos } from '../../data/segmentos'
import { PageHeader, ConfirmDialog } from '../../components/ui'
import type { Segmento } from '../../types'

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

export default function SegmentoList() {
  const [data, setData] = useState(initialSegmentos)
  const [nome, setNome] = useState('')
  const [editing, setEditing] = useState<Segmento | null>(null)
  const [selected, setSelected] = useState<Segmento | null>(null)
  const [deleting, setDeleting] = useState(false)

  const modalState = useOverlayState()
  const deleteState = useOverlayState()

  const handleOpenNew = () => {
    setEditing(null)
    setNome('')
    modalState.open()
  }

  const handleOpenEdit = (seg: Segmento) => {
    setEditing(seg)
    setNome(seg.nome)
    modalState.open()
  }

  const handleSave = () => {
    if (editing) {
      setData(data.map((s) => (s.id === editing.id ? { ...s, nome } : s)))
    } else {
      setData([...data, { id: Date.now(), nome }])
    }
    modalState.close()
  }

  const handleDelete = () => {
    if (!selected) return
    setDeleting(true)
    setTimeout(() => {
      setData(data.filter((s) => s.id !== selected.id))
      setDeleting(false)
      deleteState.close()
      setSelected(null)
    }, 400)
  }

  return (
    <div>
      <PageHeader
        title="Segmentos"
        subtitle={`${data.length} segmentos cadastrados`}
        actions={
          <Button variant="primary" onPress={handleOpenNew}>+ Novo Segmento</Button>
        }
      />

      <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['#', 'Nome do Segmento', ''].map((h) => (
                <th key={h} scope="col" style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((seg, idx) => (
              <tr
                key={seg.id}
                style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-muted)', width: 48 }}>{idx + 1}</td>
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{seg.nome}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onPress={() => handleOpenEdit(seg)} style={{ fontSize: 13 }}>Editar</Button>
                    <Button
                      variant="ghost"
                      onPress={() => { setSelected(seg); deleteState.open() }}
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

      <Modal isOpen={modalState.isOpen} onOpenChange={modalState.setOpen}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>{editing ? 'Editar Segmento' : 'Novo Segmento'}</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <label htmlFor="segmento-nome" style={labelStyle}>Nome <span aria-hidden="true">*</span><span className="sr-only">(obrigatório)</span></label>
                <input
                  id="segmento-nome"
                  aria-required="true"
                  style={inputStyle}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do segmento"
                  autoFocus
                />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline" onPress={modalState.close}>Cancelar</Button>
                <Button variant="primary" onPress={handleSave} isDisabled={!nome.trim()}>
                  {editing ? 'Salvar' : 'Cadastrar'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <ConfirmDialog
        state={deleteState}
        title="Excluir Segmento"
        message={`Tem certeza que deseja excluir o segmento "${selected?.nome}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
