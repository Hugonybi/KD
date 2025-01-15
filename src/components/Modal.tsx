import { FC, PropsWithChildren } from 'react'

interface Props {
  show: boolean
  onClose: () => void
}

const Modal: FC<PropsWithChildren<Props>> = ({ show, onClose, children }) => {
  if (!show) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal
