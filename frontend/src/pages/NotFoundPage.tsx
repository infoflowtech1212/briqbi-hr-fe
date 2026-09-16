import { Link } from 'react-router-dom'
import { TopBar, SiteFooter } from '../components/Chrome'

export default function NotFoundPage() {
  return (
    <>
      <TopBar tag="briqbi hr" />
      <main className="page-body">
        <div className="wrap">
          <span className="eyebrow on-light">404</span>
          <h1 style={{ fontSize: 28, marginTop: 8, marginBottom: 12 }}>Nothing at this address.</h1>
          <p style={{ color: 'var(--ink-muted)', marginBottom: 20 }}>
            Check the link, or head back to the console.
          </p>
          <Link className="btn btn-solid-dark" to="/">
            Back to console
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
