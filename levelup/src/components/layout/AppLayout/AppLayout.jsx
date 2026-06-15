import { Suspense, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import BottomNav from '../BottomNav/BottomNav'
import Spinner from '../../ui/Spinner/Spinner'
import { useCharacter } from '../../../hooks/useCharacter'

import styles from './AppLayout.module.css'

/**
 * Wraps all authenticated routes:
 *  - Loads the user's character on mount
 *  - Redirects to character creation when none exists yet
 *  - Renders Outlet + bottom navigation
 */
export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { character, loading, hasCharacter } = useCharacter()

  // Force users without a character into the creation flow.
  useEffect(() => {
    if (!loading && !hasCharacter && location.pathname !== '/create-character') {
      navigate('/create-character', { replace: true })
    }
  }, [loading, hasCharacter, location.pathname, navigate])

  if (loading && !character) {
    return <Spinner fullScreen label="A carregar personagem..." />
  }

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <Suspense fallback={<Spinner fullScreen />}>
          <Outlet />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  )
}
