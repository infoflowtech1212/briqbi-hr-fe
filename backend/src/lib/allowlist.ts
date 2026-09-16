/**
 * Deliberately duplicated from `../../../shared/access.ts`, not imported.
 * `shared/` is consumed by `frontend/` through Vite (a bundler, no rootDir/
 * emit constraints) but this package is compiled by plain `tsc`, which needs
 * every file it emits to sit under one rootDir — importing shared/*.ts
 * directly here would force backend's build to also emit shared/'s output,
 * nested and nowhere useful. Keep this in sync with shared/access.ts by hand
 * until forms.ts/optionSets.ts need sharing too and it's worth setting up
 * real TS project references or an npm workspace for it.
 */
export const ALLOWED_EMAIL_DOMAINS = ['briqbi.com']

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  return ALLOWED_EMAIL_DOMAINS.includes(domain)
}
