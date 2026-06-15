import styles from './Card.module.css'

/**
 * Card primitive — dark background with subtle border.
 * Use `hoverable` for interactive cards (e.g. clickable list items).
 */
export default function Card({
  children,
  onClick,
  hoverable = false,
  glow = false,
  className = '',
  ...rest
}) {
  const Tag = onClick ? 'button' : 'div'
  const classes = [
    styles.card,
    hoverable || onClick ? styles.hoverable : '',
    glow ? styles.glow : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag
      className={classes}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}
