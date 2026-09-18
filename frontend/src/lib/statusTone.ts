/**
 * Maps a Dataverse choice value to the Done / Attention / Failed semantics
 * defined in briqbi-hr-design-system.md §1. These reuse module-accent hues
 * (green=Hiring, orange=Development) for their status meaning rather than
 * their module meaning — a deliberate trade the design doc flags itself.
 */
import { choiceLabel, type Choice } from '@shared/optionSets'

export type Tone = 'green' | 'orange' | 'danger'

function build(done: number[], attention: number[], failed: number[]) {
  return (value: number): Tone => {
    if (done.includes(value)) return 'green'
    if (failed.includes(value)) return 'danger'
    if (attention.includes(value)) return 'orange'
    return 'orange'
  }
}

export const docStatusTone = build([3, 6], [0, 1, 2], [4, 5])
export const checkStatusTone = build([3], [0, 1, 2], [4])
export const assetStatusTone = build([1, 3], [0, 2], [4])
export const offerStatusTone = build([3], [0, 1, 2], [4, 5, 6])
export const taskStatusTone = build([2], [0, 1], [3])
export const trainingStatusTone = build([2, 3], [0, 1, 4], [5])
export const candidateStageTone = build([4], [0, 1, 2, 3], [5, 6, 7])
export const openingStatusTone = build([3], [0, 1, 2], [4])
export const recommendationTone = build([0, 1, 2], [], [3, 4])
export const checkOutcomeTone = build([1], [0], [2, 3])

export function toneLabel(set: Choice[], value: number, tone: (v: number) => Tone) {
  return { label: choiceLabel(set, value), tone: tone(value) }
}

/** Real intranet job-application status (string, not a Dataverse choice). */
export function applicationStatusTone(status: string): Tone {
  if (status === 'hired') return 'green'
  if (status === 'rejected') return 'danger'
  return 'orange' // applied, reviewing, shortlisted
}
