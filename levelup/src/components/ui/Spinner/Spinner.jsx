import styles from './Spinner.module.css'

export default function Spinner({ size = 'md', fullScreen = false, label }) {
  const dimension = size === 'sm' ? 18 : size === 'lg' ? 40 : 28

  const spinner = (
    <span
      className={styles.spinner}
      style={{ width: dimension, height: dimension }}
      role="status"
      aria-label={label ?? 'A carregar'}
    />
  )

  if (fullScreen) {
    return (
      <div className={styles.fullScreen}>
        {spinner}
        {label && <span className={styles.label}>{label}</span>}
      </div>
    )
  }
  return spinner
}
