/**
 * Server-side Firebase Admin — verifies the ID token the frontend gets from
 * `signInWithPopup`. This is the actual security boundary: the frontend's
 * own allowlist check only decides what to render (see shared/access.ts).
 *
 * Adapted from required-file-for-login/firebase.ts. The service account key
 * lives at this package's root (gitignored — never commit it).
 */
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// require(), not import — the JSON's snake_case fields match what cert()
// expects at runtime but not its typed ServiceAccount (camelCase) overload.
const serviceAccount = require('../../briqbi-intranet-firebase-adminsdk-fbsvc-c319759841.json')

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

export function verifyFirebaseToken(idToken: string) {
  return getAuth().verifyIdToken(idToken)
}
