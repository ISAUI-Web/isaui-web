import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog"
import { Button } from "./button"

interface CustomDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  showCancel?: boolean
}

export function CustomDialog({
  open,
  onClose,
  title,
  description,
  cancelLabel = "Cancelar",
  confirmLabel = "Aceptar",
  onConfirm,
  showCancel = false,
}: CustomDialogProps) {
  const handleConfirm = () => {
    if (onConfirm) onConfirm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          {showCancel && (
            <Button variant="outline" onClick={onClose}>
              {cancelLabel}
            </Button>
          )}
          <Button onClick={handleConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
