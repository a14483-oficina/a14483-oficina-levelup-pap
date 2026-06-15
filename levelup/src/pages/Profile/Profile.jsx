import { useEffect, useState } from 'react'
import { LogOut, Mail, AtSign, Calendar } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { getUserProfile } from '../../services/userService'
import { formatDateLong } from '../../utils/helpers'

import Header from '../../components/layout/Header/Header'
import Card from '../../components/ui/Card/Card'
import Button from '../../components/ui/Button/Button'
import Avatar from '../../components/ui/Avatar/Avatar'
import Skeleton from '../../components/ui/Skeleton/Skeleton'

import styles from './Profile.module.css'

export default function Profile() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        const data = await getUserProfile(user.id)
        if (!cancelled) setProfile(data)
      } catch (error) {

        console.error('getUserProfile error:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const username =
    profile?.username ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'Utilizador'
  const email = profile?.email ?? user?.email ?? ''
  const memberSince = profile?.created_at ?? user?.created_at

  return (
    <>
      <Header title="Perfil" />
      <div className={styles.page}>
        <Card className={styles.card}>
          <div className={styles.headerRow}>
            <Avatar src={profile?.avatar_url} fallback={username} size="xl" />
            <div className={styles.headerInfo}>
              {loading ? (
                <>
                  <Skeleton height={20} width="60%" />
                  <Skeleton height={14} width="80%" />
                </>
              ) : (
                <>
                  <h2 className={styles.username}>{username}</h2>
                  <p className={styles.email}>{email}</p>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className={styles.card}>
          <h3 className={styles.sectionTitle}>Informação da conta</h3>
          <ul className={styles.infoList}>
            <InfoRow icon={<AtSign size={18} />} label="Nome de utilizador" value={username} />
            <InfoRow icon={<Mail size={18} />} label="Email" value={email} />
            <InfoRow
              icon={<Calendar size={18} />}
              label="Membro desde"
              value={formatDateLong(memberSince) || '—'}
            />
          </ul>
        </Card>

        <Button
          variant="danger"
          fullWidth
          size="lg"
          onClick={signOut}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
  <LogOut size={18} /> Sair da conta
</span>
        </Button>
      </div>
    </>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <li className={styles.infoRow}>
      <span className={styles.infoIcon}>{icon}</span>
      <div className={styles.infoText}>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue}>{value}</span>
      </div>
    </li>
  )
}
