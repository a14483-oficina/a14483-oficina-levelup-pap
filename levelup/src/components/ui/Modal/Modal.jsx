import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import styles from './Modal.module.css'

/**
 * Portal-based modal. Closes on backdrop click and Escape.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
}) {
  // Lock body scroll + handle Escape
  useEffect(() => {
    if (!isOpen) return undefined

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={`${styles.modal} ${styles[`size-${size}`]}`}>
        {(title || onClose) && (
          <header className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className={styles.closeBtn}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            )}
          </header>
        )}
        <div className={styles.body}>{children}</div>
        {actions && <footer className={styles.footer}>{actions}</footer>}
      </div>
    </div>,
    document.body,
  )
}
