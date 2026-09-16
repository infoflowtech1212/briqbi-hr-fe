import type { ReactNode } from 'react'
import type { ModuleAccent } from '@shared/forms'
import { ONBOARDING_STAGE } from '@shared/optionSets'

export function Badge({ accent, children }: { accent: ModuleAccent; children: ReactNode }) {
  return <div className={`badge tone-${accent}`}>{children}</div>
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="section-head">
      <div className="section-head-text">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action && <div className="section-head-action">{action}</div>}
    </div>
  )
}

export function StatusPill({
  tone,
  children,
}: {
  tone: ModuleAccent | 'danger' | 'neutral'
  children: ReactNode
}) {
  return <span className={`status-pill tone-${tone}`}>{children}</span>
}

/** Seven named onboarding states, not a completion percentage (§5). */
export function StageTracker({ currentStage }: { currentStage: number }) {
  return (
    <div className="stage-tracker">
      {ONBOARDING_STAGE.map((stage) => {
        const state = stage.value < currentStage ? 'is-done' : stage.value === currentStage ? 'is-current' : ''
        return (
          <span key={stage.value} className={`stage-tick ${state}`}>
            {stage.label}
          </span>
        )
      })}
    </div>
  )
}

export function StatRow({ stats }: { stats: { num: string; cap: string }[] }) {
  return (
    <div className="stat-row">
      {stats.map((s) => (
        <div className="stat" key={s.cap}>
          <div className="num tabular">{s.num}</div>
          <div className="cap">{s.cap}</div>
        </div>
      ))}
    </div>
  )
}
