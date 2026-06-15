import { Link } from 'react-router-dom'
import Button from '../components/ui/Button/Button'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '24px',
        padding: '24px',
        textAlign: 'center',
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--text-hero)',
          fontWeight: 700,
          color: 'var(--color-primary)',
          letterSpacing: '-1px',
        }}
      >
        404
      </div>
      <h1 style={{ fontSize: 'var(--text-title)', margin: 0 }}>
        Página não encontrada
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
        A página que procuras não existe ou foi removida.
      </p>
      <Link to="/">
        <Button variant="primary">Voltar ao início</Button>
      </Link>
    </main>
  )
}
