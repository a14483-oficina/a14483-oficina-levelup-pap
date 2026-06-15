import { useState } from 'react'
import styles from './Avatar.module.css'
import { getInitials } from '../../../utils/helpers'

/** Sizes (px): sm=32, md=48, lg=72, xl=96 */
const SIZES = { sm: 32, md: 48, lg: 72, xl: 96 }

export default function Avatar({
  src,
  alt = '',
  fallback,
  size = 'md',
  className = '',
}) {
  const [errored, setErrored] = useState(false)
  const dimension = SIZES[size] ?? SIZES.md

  return (
    <span
      className={`${styles.avatar} ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      {src && !errored ? (
        <img
          src={src}
          alt={alt}
          className={styles.image}
          onError={() => setErrored(true)}
          loading="lazy"
        />
      ) : (
        <span
          className={styles.fallback}
          style={{ fontSize: dimension * 0.4 }}
        >
          {getInitials(fallback ?? alt)}
        </span>
      )}
    </span>
  )
}
