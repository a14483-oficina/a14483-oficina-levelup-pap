import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateUsername,
} from '../../utils/validators'

import Button from '../../components/ui/Button/Button'
import Input from '../../components/ui/Input/Input'

import styles from './Auth.module.css'

export default function Signup() {
  const { signUp, isAuthenticated, loading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})

  if (!loading && isAuthenticated) return <Navigate to="/" replace />

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((e) => ({ ...e, [name]: null }))
  }

  function validate() {
    const next = {
      username: validateUsername(form.username),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: validatePasswordConfirm(
        form.password,
        form.confirmPassword,
      ),
    }
    setErrors(next)
    return Object.values(next).every((v) => v === null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await signUp({
        email: form.email.trim(),
        password: form.password,
        username: form.username.trim(),
      })
    } catch (err) {
      console.error('[Signup] Erro ao criar conta:', err)
      console.error('[Signup] Detalhes:', {
        message: err?.message,
        status: err?.status ?? err?.statusCode,
        response: err?.response,
        cause: err?.cause,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.logo} aria-hidden="true">
            LU
          </div>
          <h1 className={styles.title}>Criar conta</h1>
          <p className={styles.subtitle}>
            Cria a tua conta e começa a tua aventura.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="Nome de utilizador"
            type="text"
            autoComplete="username"
            placeholder="o_teu_nome"
            value={form.username}
            onChange={(e) => setField('username', e.target.value)}
            error={errors.username}
            disabled={submitting}
            hint="3–30 caracteres. Letras, números e _ apenas."
          />
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
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            error={errors.password}
            disabled={submitting}
          />
          <Input
            label="Confirmar palavra-passe"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => setField('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            disabled={submitting}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
          >
            Criar conta
          </Button>
        </form>

        <p className={styles.footer}>
          Já tens conta?{' '}
          <Link to="/login" className={styles.link}>
            Entrar
          </Link>
        </p>
      </div>
    </main>
  )
}