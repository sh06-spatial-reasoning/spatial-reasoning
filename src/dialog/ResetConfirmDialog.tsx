import { Dialog } from './Dialog.tsx'

type ResetConfirmDialogProps = {
  /** Whether the dialog is visible. */
  isOpen: boolean
  /** Closes the dialog without resetting the structure. */
  close: () => void
  /** Called when the reset is confirmed. */
  onConfirm: () => void
}

/** Confirmation dialog shown before resetting the current structure to a single cube at the origin. */
export function ResetConfirmDialog({ isOpen, close, onConfirm }: ResetConfirmDialogProps) {
  function onClickConfirmCallback() {
    onConfirm()
    close()
  }

  return (
    <Dialog isOpen={isOpen} close={close} title='Reset Structure'>
      <section className='modal-body' style={{ minHeight: 'auto' }}>
        <p>
          Are you sure that you want to reset the structure?<br />
          All current blocks will be removed and the drawing will go back to one cube at the origin, with the rotation reset.
        </p>
        <footer className='modal-footer'>
          <button className='btn btn-secondary' onClick={close}>Cancel</button>
          <button className='btn btn-danger' onClick={onClickConfirmCallback}>Reset</button>
        </footer>
      </section>
    </Dialog>
  )
}
