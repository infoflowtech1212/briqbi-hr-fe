/**
 * Mock stand-in for the signed `/f/<token>` links described in the handover
 * doc: stateless, expiry baked in, signed with `LINK_SECRET` so nothing is
 * stored server-side and a flow can mint a link without a round trip.
 *
 * This client-only build has no LINK_SECRET and no server to verify against,
 * so it just base64url-encodes the payload with a checksum — enough to
 * demo the console → link → form flow. Real signing must move server-side
 * before this ships; a client-only signature can be forged by anyone.
 */

export interface LinkPayload {
  formKey: string
  subjectId: string
  subjectLabel: string
  exp: number // epoch ms
}

function toBase64Url(input: string): string {
  return btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(input.length + ((4 - (input.length % 4)) % 4), '=')
  return decodeURIComponent(escape(atob(padded)))
}

function checksum(payload: string): string {
  let hash = 0
  for (let i = 0; i < payload.length; i++) {
    hash = (hash * 31 + payload.charCodeAt(i)) >>> 0
  }
  return hash.toString(36)
}

export function encodeToken(payload: LinkPayload): string {
  const json = JSON.stringify(payload)
  const body = toBase64Url(json)
  return `${body}.${checksum(body)}`
}

export type DecodedToken =
  | { ok: true; payload: LinkPayload }
  | { ok: false; reason: 'malformed' | 'tampered' | 'expired' }

export function decodeToken(token: string): DecodedToken {
  const [body, sig] = token.split('.')
  if (!body || !sig) return { ok: false, reason: 'malformed' }
  if (checksum(body) !== sig) return { ok: false, reason: 'tampered' }
  try {
    const payload = JSON.parse(fromBase64Url(body)) as LinkPayload
    if (Date.now() > payload.exp) return { ok: false, reason: 'expired' }
    return { ok: true, payload }
  } catch {
    return { ok: false, reason: 'malformed' }
  }
}
