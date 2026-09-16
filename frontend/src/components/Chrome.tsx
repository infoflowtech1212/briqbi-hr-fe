import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDownIcon } from './icons'

export function TopBar({ tag, right }: { tag: string; right?: ReactNode }) {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="wordmark" to="/">
          briqbi<span>{tag}</span>
        </Link>
        {right}
      </div>
    </header>
  )
}

export function Identity({ name, role, on = 'dark' }: { name: string; role: string; on?: 'dark' | 'light' }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div className={`identity${on === 'light' ? ' on-light' : ''}`}>
      <div className="avatar">{initial}</div>
      <div className="who">
        <div className="name">{name}</div>
        <div className="role">{role}</div>
      </div>
    </div>
  )
}

export function ProfileMenu({
  name,
  email,
  role,
  onSignOut,
}: {
  name: string
  email: string
  role: string
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="profile-menu" ref={rootRef}>
      <button
        className="profile-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Identity name={name} role={role} on="light" />
        <ChevronDownIcon className={`profile-chevron${open ? ' is-open' : ''}`} />
      </button>
      {open && (
        <div className="profile-dropdown" role="menu">
          <div className="profile-dropdown-header">
            <div className="avatar">{name.trim().charAt(0).toUpperCase() || '?'}</div>
            <div>
              <div className="profile-dropdown-name">{name}</div>
              <div className="profile-dropdown-email">{email}</div>
            </div>
          </div>
          <div className="profile-dropdown-role">{role}</div>
          <div className="profile-dropdown-divider" />
          <button
            className="profile-dropdown-item"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <span>briqbi HR forms · internal tool</span>
        <span>Captured from intranet.briqbi.com · v1.0</span>
      </div>
    </footer>
  )
}
