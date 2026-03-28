import { useState } from 'react'
import { Button, Modal, useOverlayState } from '@heroui/react'
import { usuarios as initialUsuarios } from '../../data/usuarios'
import { PageHeader, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import type { Usuario, UserRole } from '../../types'

const PERFIS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'vendedor', label: 'Vendedor' },
]

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

const EMPTY_FORM = { nome: '', email: '', cargo: '', perfil: 'vendedor' as UserRole, ativo: true }

export default function UsuarioList() {
  const [data, setData] = useState(initialUsuarios)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [selected, setSelected] = useState<Usuario | null>(null)
  const [deleting, setDeleting] = useState(false)

  const modalState = useOverlayState()
  const deleteState = useOverlayState()

  const handleOpenNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    modalState.open()
  }

  const handleOpenEdit = (u: Usuario) => {
    setEditing(u)
    setForm({ nome: u.nome, email: u.email, cargo: u.cargo, perfil: u.perfil, ativo: u.ativo })
    modalState.open()
  }

  const handleSave = () => {
    if (editing) {
      setData(data.map((u) => (u.id === editing.id ? { ...u, ...form } : u)))
    } else {
      setData([...data, { id: Date.now(), ...form }])
    }
    modalState.close()
  }

  const handleDelete = () => {
    if (!selected) return
    setDeleting(true)
    setTimeout(() => {
      setData(data.filter((u) => u.id !== selected.id))
      setDeleting(false)
      deleteState.close()
      setSelected(null)
    }, 400)
  }

  const setF = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }))

  return (
    <div>
      <PageHeader
        title="Usuários"
        subtitle={`${data.length} usuários cadastrados`}
        actions={
          <Button variant="primary" onPress={handleOpenNew}>+ Novo Usuário</Button>
        }
      />

      <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Nome', 'E-mail', 'Cargo', 'Perfil', 'Status', ''].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((usuario) => {
              const perfilLabel = PERFIS.find((p) => p.value === usuario.perfil)?.label ?? usuario.perfil
              return (
                <tr
                  key={usuario.id}
                  style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-muted)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{usuario.nome}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-brand-accent)' }}>{usuario.email}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{usuario.cargo}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={usuario.perfil === 'admin' ? 'brand' : usuario.perfil === 'gestor' ? 'pending' : 'neutral'}>
                      {perfilLabel}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={usuario.ativo ? 'active' : 'inactive'}>{usuario.ativo ? 'Ativo' : 'Inativo'}</Badge>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" onPress={() => handleOpenEdit(usuario)} style={{ fontSize: 13 }}>Editar</Button>
                      <Button
                        variant="ghost"
                        onPress={() => { setSelected(usuario); deleteState.open() }}
                        style={{ fontSize: 13, color: 'var(--color-danger)' }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalState.isOpen} onOpenChange={modalState.setOpen}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>{editing ? 'Editar Usuário' : 'Novo Usuário'}</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Nome *</label>
                    <input style={inputStyle} value={form.nome} onChange={(e) => setF('nome', e.target.value)} placeholder="Nome completo" />
                  </div>
                  <div>
                    <label style={labelStyle}>E-mail *</label>
                    <input style={inputStyle} type="email" value={form.email} onChange={(e) => setF('email', e.target.value)} placeholder="email@empresa.com" />
                  </div>
                  <div>
                    <label style={labelStyle}>Cargo</label>
                    <input style={inputStyle} value={form.cargo} onChange={(e) => setF('cargo', e.target.value)} placeholder="Ex: Consultor Comercial" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Perfil *</label>
                      <select style={inputStyle} value={form.perfil} onChange={(e) => setF('perfil', e.target.value as UserRole)}>
                        {PERFIS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', paddingBottom: 8 }}>
                        <input
                          type="checkbox"
                          checked={form.ativo}
                          onChange={(e) => setF('ativo', e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: 'var(--color-brand-primary)' }}
                        />
                        <span style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>Usuário ativo</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline" onPress={modalState.close}>Cancelar</Button>
                <Button variant="primary" onPress={handleSave} isDisabled={!form.nome || !form.email}>
                  {editing ? 'Salvar' : 'Cadastrar'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <ConfirmDialog
        state={deleteState}
        title="Excluir Usuário"
        message={`Tem certeza que deseja excluir "${selected?.nome}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
