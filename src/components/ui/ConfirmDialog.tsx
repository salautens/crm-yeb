import { AlertDialog, Button } from '@heroui/react'
import type { UseOverlayStateReturn } from '@heroui/react'

interface ConfirmDialogProps {
  state: UseOverlayStateReturn
  title: string
  message: string
  onConfirm: () => void
  loading?: boolean
  confirmLabel?: string
}

export function ConfirmDialog({
  state,
  title,
  message,
  onConfirm,
  loading = false,
  confirmLabel = 'Excluir',
}: ConfirmDialogProps) {
  return (
    <AlertDialog isOpen={state.isOpen} onOpenChange={state.setOpen}>
      <AlertDialog.Backdrop isDismissable={!loading} isKeyboardDismissDisabled={loading}>
        <AlertDialog.Container size="sm">
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{message}</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="outline" onPress={state.close} isDisabled={loading}>
                Cancelar
              </Button>
              <Button variant="danger" onPress={onConfirm} isDisabled={loading}>
                {confirmLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}
