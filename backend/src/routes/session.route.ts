/**
 * POST /api/session — the frontend calls this right after Firebase sign-in
 * (Microsoft as the identity provider), passing the ID token as a bearer
 * header. This is the real security boundary: verifies the token against
 * Firebase, then applies the same allowlist the frontend uses to decide
 * what to render. A client-side check alone stops nobody — anyone can curl
 * this API.
 */
import { Router, type Request, type Response } from 'express'
import { verifyFirebaseToken } from '../lib/firebaseAdmin'
import { isAllowedEmail } from '../lib/allowlist'

export const sessionRouter = Router()

sessionRouter.post('/session', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization ?? ''
  const idToken = authHeader.replace(/^Bearer\s+/i, '')

  if (!idToken) {
    return res.status(401).json({ error: 'Missing bearer token' })
  }

  let decoded
  try {
    decoded = await verifyFirebaseToken(idToken)
  } catch (err) {
    console.warn('Firebase token verification failed', err)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  if (!isAllowedEmail(decoded.email)) {
    return res.status(403).json({ error: 'Not an allowed account' })
  }

  return res.status(200).json({
    uid: decoded.uid,
    email: decoded.email,
    name: decoded.name ?? decoded.email,
  })
})
