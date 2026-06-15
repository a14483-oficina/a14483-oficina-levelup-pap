import { NavLink } from 'react-router-dom'
import { Home, Swords, Shield, Trophy, User } from 'lucide-react'
import styles from './BottomNav.module.css'

const TABS = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/missions', label: 'Missões', icon: Swords, end: false },
  { to: '/character', label: 'Personagem', icon: Shield, end: false },
  { to: '/rankings', label: 'Ranking', icon: Trophy, end: false },
  { to: '/profile', label: 'Perfil', icon: User, end: false },
]

export default function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      <div className={styles.inner}>
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `${styles.tab} ${isActive ? styles.tabActive : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    aria-hidden="true"
                  />
                  <span className={styles.label}>{tab.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
