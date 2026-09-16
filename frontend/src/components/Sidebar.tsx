import { NavLink } from 'react-router-dom'
import { NAV_GROUPS } from '../lib/navConfig'

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="wordmark">
          briqbi<span>hr</span>
        </span>
      </div>
      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group) => (
          <div className="sidebar-group" key={group.label}>
            <div className="sidebar-group-label">
              {group.accent && <span className={`sidebar-dot tone-${group.accent}`} />}
              {group.label}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
              >
                <item.icon />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
