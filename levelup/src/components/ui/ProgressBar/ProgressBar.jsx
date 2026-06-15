import styles from './ProgressBar.module.css'
import { percent } from '../../../utils/helpers'

/**
 * Smooth horizontal progress bar.
 * Color variants: primary (default) | success | warning | error
 */
export default function ProgressBar({
  current = 0,
  max = 100,
  variant = 'primary',
  showLabel = false,
  label,
  height = 10,
}) {
  const pct = percent(current, max)

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.track}
        style={{ height: `${height}px` }}
        role="progressbar"
        aria-valuenow={Math.round(current)}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`${styles.fill} ${styles[`variant-${variant}`]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className={styles.label}>
          {label ?? `${Math.round(current)} / ${max}`}
        </div>
      )}
    </div>
  )
}
