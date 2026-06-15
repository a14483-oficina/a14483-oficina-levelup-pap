import styles from './Badge.module.css'

/**
 * Variants:
 *  - success | neutral | xp | warning | error | info
 *  - rarity-common | rarity-uncommon | rarity-rare | rarity-epic | rarity-legendary
 */
export default function Badge({ variant = 'neutral', children, className = '' }) {
  return (
    <span
      className={`${styles.badge} ${styles[`variant-${variant}`]} ${className}`}
    >
      {children}
    </span>
  )
}
