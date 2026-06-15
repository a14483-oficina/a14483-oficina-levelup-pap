/** Pure utility helpers. */

/** Get initials from a name (max 2 chars). */
export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Format a date as a localized Portuguese string (dd/mm/yyyy). */
export function formatDate(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Format a date as "12 de maio de 2026". */
export function formatDateLong(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Translate raw Supabase auth errors into friendly Portuguese messages. */
export function translateAuthError(error) {
  if (!error) return 'Ocorreu um erro. Tenta novamente.'
  const msg = (error.message || error.toString() || '').toLowerCase()

  if (msg.includes('invalid login credentials'))
    return 'Email ou palavra-passe incorretos.'
  if (msg.includes('email not confirmed'))
    return 'Confirma o teu email antes de entrar.'
  if (msg.includes('user already registered'))
    return 'Este email já está registado.'
  if (msg.includes('weak password') || msg.includes('password'))
    return 'A palavra-passe é demasiado fraca.'
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Demasiadas tentativas. Espera um pouco e tenta novamente.'
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Erro de ligação. Verifica a tua internet.'

  return 'Ocorreu um erro. Tenta novamente.'
}

/** Clamp a number between min and max. */
export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

/** Compute % progress (0–100). */
export function percent(current, total) {
  if (!total || total <= 0) return 0
  return clamp((current / total) * 100, 0, 100)
}

/** ISO date (YYYY-MM-DD) for the given Date in local time. */
export function toISODate(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Today's date as an ISO date string (YYYY-MM-DD). */
export function todayISO() {
  return toISODate(new Date())
}

/** Yesterday's date as an ISO date string (YYYY-MM-DD). */
export function yesterdayISO() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toISODate(d)
}

/** Difference in calendar days between two ISO dates (b - a). Positive when b is later. */
export function daysBetween(aISO, bISO) {
  if (!aISO || !bISO) return null
  const a = new Date(`${aISO}T00:00:00`)
  const b = new Date(`${bISO}T00:00:00`)
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

/** ISO date for the Monday of the week containing `date`. */
export function startOfWeekISO(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : new Date(date)
  const day = d.getDay() // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toISODate(d)
}

/** Pick `count` random elements from an array (no mutation). */
export function pickRandom(arr, count) {
  if (!Array.isArray(arr) || arr.length === 0) return []
  const copy = [...arr]
  const out = []
  const n = Math.min(count, copy.length)
  for (let i = 0; i < n; i += 1) {
    const idx = Math.floor(Math.random() * copy.length)
    out.push(copy.splice(idx, 1)[0])
  }
  return out
}
