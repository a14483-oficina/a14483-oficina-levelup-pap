import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout/AppLayout'
import Spinner from './components/ui/Spinner/Spinner'

// Lazy-loaded pages — keeps the initial bundle small.
const Login = lazy(() => import('./pages/Auth/Login'))
const Signup = lazy(() => import('./pages/Auth/Signup'))
const CharacterCreation = lazy(
  () => import('./pages/Character/CharacterCreation'),
)
const Home = lazy(() => import('./pages/Home/Home'))
const Missions = lazy(() => import('./pages/Missions/MissionsPage'))
const Character = lazy(() => import('./pages/Character/Character'))
const Rankings = lazy(() => import('./pages/Rankings/Rankings'))
const Profile = lazy(() => import('./pages/Profile/Profile'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Spinner fullScreen label="A carregar..." />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Character creation (protected, no AppLayout) */}
            <Route
              path="/create-character"
              element={
                <ProtectedRoute>
                  <CharacterCreation />
                </ProtectedRoute>
              }
            />

            {/* Authenticated app — wrapped in AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="missions" element={<Missions />} />
              <Route path="character" element={<Character />} />
              <Route path="rankings" element={<Rankings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="dashboard" element={<Navigate to="/" replace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-caption)',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: 'var(--color-success-text)',
                secondary: 'var(--color-bg-elevated)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--color-error)',
                secondary: 'var(--color-bg-elevated)',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
