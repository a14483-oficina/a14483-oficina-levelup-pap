import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { validateEmail, validatePassword } from '../../utils/validators'

import Button from '../../components/ui/Button/Button'
import Input from '../../components/ui/Input/Input'

import styles from './Auth.module.css'

export default function Login() {
  const { signIn, isAuthenticated, loading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  if (!loading && isAuthenticated) return <Navigate to="/" replace />

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((e) => ({ ...e, [name]: null }))
  }

  function validate() {
    const next = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    }
    setErrors(next)
    return !next.email && !next.password
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await signIn({ email: form.email.trim(), password: form.password })
    } catch {
      // toast already shown in hook
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <img src="/logo.png" alt="LevelUP" className={styles.logo} style={{ mixBlendMode: 'screen' }} />
          <h1 className={styles.title}>LevelUP</h1>
          <p className={styles.subtitle}>
            Entra para continuar a tua aventura.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="exemplo@email.com"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            error={errors.email}
            disabled={submitting}
          />
          <Input
            label="Palavra-passe"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            error={errors.password}
            disabled={submitting}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
          >
            Entrar
          </Button>
        </form>

        <p className={styles.footer}>
          Ainda não tens conta?{' '}
          <Link to="/signup" className={styles.link}>
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  )
}
