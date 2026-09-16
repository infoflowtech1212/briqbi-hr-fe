/**
 * Sign-in allowlist for the internal console (`/`).
 *
 * Per the handover doc, this check is enforced twice and only one copy matters:
 * this browser copy decides what to render — it stops nobody by itself.
 * The real security boundary is the Azure Function, which verifies the Entra
 * token signature against the tenant JWKS plus issuer/audience/tenant id
 * before applying this same allowlist. Never treat this file as authorization.
 */

export const ALLOWED_EMAIL_DOMAINS = ['briqbi.com']

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  return ALLOWED_EMAIL_DOMAINS.includes(domain)
}
