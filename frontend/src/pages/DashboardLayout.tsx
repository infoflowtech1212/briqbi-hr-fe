import { Outlet } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import { Sidebar } from '../components/Sidebar'
import { ProfileMenu } from '../components/Chrome'

export default function DashboardLayout() {
  const { session, loading, error, signIn, signOut } = useAuth()

  if (loading) {
    return (
      <div className="auth-gate">
        <div className="auth-gate-content">
          <span className="eyebrow on-dark">BRIQBI HR · INTERNAL DASHBOARD</span>
          <p className="lede" style={{ marginBottom: 0 }}>
            Checking your session…
          </p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="auth-gate">
        <div className="auth-gate-content">
          <span className="eyebrow on-dark">BRIQBI HR · INTERNAL DASHBOARD</span>
          <h1>
            Sign in to <span className="accent">continue.</span>
          </h1>
          <p className="lede">
            Team Members, Hiring, Checks, Development and Kit — everything the ten forms collect, in one place. HR
            and managers only.
          </p>
          <button className="btn btn-primary" onClick={() => void signIn()}>
            Sign in with Microsoft
          </button>
          {error && (
            <p className="error" style={{ marginTop: 16 }}>
              {error}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <span className="eyebrow on-light">BRIQBI HR</span>
          <ProfileMenu name={session.name} email={session.email} role="Employee" onSignOut={() => void signOut()} />
        </div>
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
