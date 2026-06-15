import styles from './Header.module.css'

export default function Header({ title, leading, trailing }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.slot}>{leading}</div>
        <h1 className={styles.title}>{title}</h1>
        <div className={`${styles.slot} ${styles.trailing}`}>{trailing}</div>
      </div>
    </header>
  )
}
