/** Form validators. Return null when valid, or a Portuguese error message. */

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateUsername(value) {
  const v = (value ?? '').trim()
  if (!v) return 'Indica um nome de utilizador.'
  if (v.length < 3) return 'O nome de utilizador deve ter pelo menos 3 caracteres.'
  if (v.length > 30) return 'O nome de utilizador não pode ter mais de 30 caracteres.'
  if (!USERNAME_REGEX.test(v))
    return 'Apenas letras, números e _ são permitidos.'
  return null
}

export function validateEmail(value) {
  const v = (value ?? '').trim()
  if (!v) return 'Indica o teu email.'
  if (!EMAIL_REGEX.test(v)) return 'Email inválido.'
  return null
}

export function validatePassword(value) {
  const v = value ?? ''
  if (!v) return 'Indica uma palavra-passe.'
  if (v.length < 6) return 'A palavra-passe deve ter pelo menos 6 caracteres.'
  return null
}

export function validatePasswordConfirm(password, confirm) {
  if (!confirm) return 'Confirma a palavra-passe.'
  if (password !== confirm) return 'As palavras-passe não coincidem.'
  return null
}

export function validateCharacterName(value) {
  const v = (value ?? '').trim()
  if (!v) return 'Dá um nome ao teu personagem.'
  if (v.length < 3) return 'O nome deve ter pelo menos 3 caracteres.'
  if (v.length > 20) return 'O nome não pode ter mais de 20 caracteres.'
  return null
}
