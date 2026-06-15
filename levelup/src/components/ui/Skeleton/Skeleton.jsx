import styles from './Skeleton.module.css'

export default function Skeleton({
  width = '100%',
  height = 16,
  variant = 'rect',
  className = '',
}) {
  const radius =
    variant === 'circle' ? '50%' : variant === 'text' ? '4px' : '8px'

  return (
    <span
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: radius,
      }}
      aria-hidden="true"
    />
  )
}
