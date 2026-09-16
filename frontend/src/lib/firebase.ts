/**
 * Client-side Firebase — same project as intranet.briqbi.com
 * (briqbi-intranet), so signing in here is the same account. The ID token
 * this produces is verified server-side in `backend/src/functions/session.ts`
 * (via firebase-admin) — that check is the real security boundary; this file
 * only decides what the browser renders.
 */
import { initializeApp } from 'firebase/app'
import { getAuth, OAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MSG_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

/** "Sign in with Microsoft" via Firebase's generic OIDC/OAuth provider support. */
export const microsoftProvider = new OAuthProvider('microsoft.com')
