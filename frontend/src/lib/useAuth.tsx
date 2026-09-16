/**
 * Real sign-in for the console, via Firebase Auth (same project as
 * intranet.briqbi.com) with Microsoft as the identity provider. Every sign-in
 * — the initial popup and any restored session — is confirmed against
 * `POST /api/session` (backend/src/routes/session.route.ts), which verifies
 * the ID token server-side via firebase-admin before applying the same
 * allowlist as `shared/access.ts`. That backend check is the real security
 * boundary; nothing here grants a session on its own.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth, microsoftProvider } from './firebase'

interface Session {
  name: string
  email: string
}

interface AuthContextValue {
  session: Session | null
  loading: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

type VerifyResult = { ok: true; session: Session } | { ok: false; reason: string }

async function verifyWithBackend(user: User): Promise<VerifyResult> {
  let idToken: string
  try {
    idToken = await user.getIdToken()
  } catch {
    return { ok: false, reason: 'Could not read the sign-in token.' }
  }

  let res: Response
  try {
    res = await fetch('/api/session', { method: 'POST', headers: { Authorization: `Bearer ${idToken}` } })
  } catch {
    return { ok: false, reason: 'Could not reach the backend to verify sign-in. Is it running?' }
  }

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    return { ok: false, reason: body?.error ?? `Sign-in check failed (${res.status}).` }
  }
  return { ok: true, session: { name: body.name, email: body.email } }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        setSession(null)
        setLoading(false)
        return
      }
      void verifyWithBackend(user).then((result) => {
        setSession(result.ok ? result.session : null)
        if (!result.ok) setError(result.reason)
        setLoading(false)
      })
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      error,
      signIn: async () => {
        setError(null)
        try {
          const result = await signInWithPopup(auth, microsoftProvider)
          const verified = await verifyWithBackend(result.user)
          if (!verified.ok) {
            await firebaseSignOut(auth)
            setError(verified.reason)
          } else {
            setSession(verified.session)
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Sign-in failed.')
        }
      },
      signOut: async () => {
        setError(null)
        await firebaseSignOut(auth)
      },
    }),
    [session, loading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
