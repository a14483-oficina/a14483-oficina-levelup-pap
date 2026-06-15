import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { useCharacter } from '../../hooks/useCharacter'
import { CLASS_TYPES, STAT_LABELS } from '../../utils/constants'
import { validateCharacterName } from '../../utils/validators'

import Button from '../../components/ui/Button/Button'
import Input from '../../components/ui/Input/Input'
import Card from '../../components/ui/Card/Card'
import Spinner from '../../components/ui/Spinner/Spinner'

import styles from './CharacterCreation.module.css'

const STEPS = { NAME: 0, CLASS: 1, CONFIRM: 2 }

export default function CharacterCreation() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    character,
    loading: charLoading,
    createCharacter,
  } = useCharacter()

  const [step, setStep] = useState(STEPS.NAME)
  const [name, setName] = useState('')
  const [classType, setClassType] = useState(null)
  const [nameError, setNameError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // If a character already exists, redirect to dashboard.
  if (charLoading) return <Spinner fullScreen label="A carregar..." />
  if (character) return <Navigate to="/" replace />
  if (!user) return <Navigate to="/login" replace />

  function handleNameNext() {
    const err = validateCharacterName(name)
    if (err) {
      setNameError(err)
      return
    }
    setStep(STEPS.CLASS)
  }

  async function handleConfirm() {
    if (!classType) return
    setSubmitting(true)
    try {
      await createCharacter({ name: name.trim(), classType })
      navigate('/', { replace: true })
    } catch {
      // toast already shown
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.stepIndicator} aria-label="Progresso">
            {[0, 1, 2].map((s) => (
              <span
                key={s}
                className={`${styles.dot} ${step >= s ? styles.dotActive : ''}`}
              />
            ))}
          </div>
          <h1 className={styles.title}>
            {step === STEPS.NAME && 'Cria o teu personagem'}
            {step === STEPS.CLASS && 'Escolhe a tua classe'}
            {step === STEPS.CONFIRM && 'Confirma o teu personagem'}
          </h1>
          <p className={styles.subtitle}>
            {step === STEPS.NAME &&
              'Como te queres chamar nesta aventura?'}
            {step === STEPS.CLASS &&
              'Cada classe começa com bónus diferentes.'}
            {step === STEPS.CONFIRM &&
              'Confere os dados antes de iniciares a tua jornada.'}
          </p>
        </header>

        {step === STEPS.NAME && (
          <div className={styles.body}>
            <Input
              label="Nome do personagem"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setNameError(null)
              }}
              error={nameError}
              placeholder="Ex: Aragorn"
              maxLength={20}
              autoFocus
            />
            <div className={styles.actions}>
              <Button onClick={handleNameNext} fullWidth size="lg">
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === STEPS.CLASS && (
          <div className={styles.body}>
            <div className={styles.classGrid}>
              {Object.entries(CLASS_TYPES).map(([key, def]) => (
                <Card
                  key={key}
                  hoverable
                  glow={classType === key}
                  onClick={() => setClassType(key)}
                  className={`${styles.classCard} ${classType === key ? styles.classCardSelected : ''}`}
                >
                  <div className={styles.classIcon} aria-hidden="true">
                    {def.icon}
                  </div>
                  <div className={styles.classInfo}>
                    <h3 className={styles.className}>{def.name}</h3>
                    <p className={styles.classDescription}>
                      {def.description}
                    </p>
                    <div className={styles.classStats}>
                      {Object.entries(def.baseStats).map(([stat, val]) => (
                        <div key={stat} className={styles.classStat}>
                          <span className={styles.classStatLabel}>
                            {STAT_LABELS[stat]}
                          </span>
                          <span className={styles.classStatValue}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className={styles.actions}>
              <Button
                variant="ghost"
                onClick={() => setStep(STEPS.NAME)}
                size="md"
              >
                Voltar
              </Button>
              <Button
                onClick={() => setStep(STEPS.CONFIRM)}
                disabled={!classType}
                fullWidth
                size="lg"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === STEPS.CONFIRM && classType && (
          <div className={styles.body}>
            <Card glow className={styles.confirmCard}>
              <div className={styles.confirmIcon} aria-hidden="true">
                {CLASS_TYPES[classType].icon}
              </div>
              <h3 className={styles.confirmName}>{name}</h3>
              <p className={styles.confirmClass}>
                {CLASS_TYPES[classType].name} · Nível 1
              </p>
              <div className={styles.statsRow}>
                {Object.entries(CLASS_TYPES[classType].baseStats).map(
                  ([stat, val]) => (
                    <div key={stat} className={styles.statBox}>
                      <span className={styles.statBoxLabel}>
                        {STAT_LABELS[stat]}
                      </span>
                      <span className={styles.statBoxValue}>{val}</span>
                    </div>
                  ),
                )}
              </div>
            </Card>

            <div className={styles.actions}>
              <Button
                variant="ghost"
                onClick={() => setStep(STEPS.CLASS)}
                disabled={submitting}
              >
                Voltar
              </Button>
              <Button
                onClick={handleConfirm}
                fullWidth
                size="lg"
                loading={submitting}
              >
                Iniciar aventura
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
