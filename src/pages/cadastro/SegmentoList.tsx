import { useState } from 'react'
import { Button, useOverlayState } from '@heroui/react'
import { segmentos as initialSegmentos } from '../../data/segmentos'
import { PageHeader, ConfirmDialog } from '../../components/ui'
import type { Segmento } from '../../types'

const S: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontSize: 14,
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  background: 'var(--color-bg-white)',
  color: 'var(--color-text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
  marginBottom: 6,
  display: 'block',
}

export default function SegmentoList() {
  const [data, setData] = useState(initialSegmentos)
  const [nome, setNome] = useState('')
  const [editing, setEditing] = useState<Segmento | null>(null)
  const [selected, setSelected] = useState<Segmento | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const deleteState = useOverlayState()

  const handleOpenNew = () => {
    setEditing(null)
    setNome('')
    setModalOpen(true)
  }

  const handleOpenEdit = (seg: Segmento) => {
    setEditing(seg)
    setNome(seg.nome)
    setModalOpen(true)
  }

  const handleSave = () => {
    if (editing) {
      setData(data.map((s) => (s.id === editing.id ? { ...s, nome } : s)))
    } else {
      setData([...data, { id: Date.now(), nome }])
    }
    setModalOpen(false)
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

      {/* Modal Novo / Editar Segmento */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setModalOpen(false)}>
          <div style={{ background: 'var(--color-bg-white)', borderRadius: 16, width: '100%', maxWidth: 760, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                {editing ? 'Editar Segmento' : 'Novo Segmento'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'var(--color-text-muted)', fontSize: 16, lineHeight: 1 }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="segmento-nome" style={labelStyle}>Nome <span aria-hidden="true" style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input
                  id="segmento-nome"
                  aria-required="true"
                  style={S}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do segmento"
                  autoFocus
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="ghost" onPress={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" onPress={handleSave} isDisabled={!nome.trim()}>
                {editing ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </div>
        </div>
      )}

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
