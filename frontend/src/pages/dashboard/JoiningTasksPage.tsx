import { useEffect, useState, type FormEvent } from 'react'
import { choiceLabel, ONBOARDING_STAGE, TASK_STATUS } from '@shared/optionSets'
import {
  createJoiningTask,
  deleteJoiningTask,
  fetchJoiningTasks,
  fetchTeamMembers,
  updateJoiningTask,
  type JoiningTask,
  type TeamMember,
} from '../../lib/api'
import { taskStatusTone } from '../../lib/statusTone'
import { PageHeader, StatusPill } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'
import { Modal } from '../../components/Modal'
import { CloseIcon } from '../../components/icons'

type Row = JoiningTask & { memberName: string }

export default function JoiningTasksPage() {
  const [tasks, setTasks] = useState<JoiningTask[] | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<JoiningTask | null>(null)
  const [deleting, setDeleting] = useState<JoiningTask | null>(null)

  function reload() {
    Promise.all([fetchJoiningTasks(), fetchTeamMembers()])
      .then(([t, m]) => {
        setTasks(t)
        setMembers(m)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load joining tasks'))
  }

  useEffect(reload, [])

  function memberName(id: string): string {
    return members.find((m) => m.id === id)?.fullName ?? 'Unknown'
  }

  const rows: Row[] | null = tasks && tasks.map((t) => ({ ...t, memberName: memberName(t.teamMemberId) }))

  const columns: Column<Row>[] = [
    { key: 'member', label: 'Person', render: (r) => r.memberName },
    { key: 'stage', label: 'Stage', render: (r) => choiceLabel(ONBOARDING_STAGE, r.stage) },
    { key: 'mustDo', label: 'Must do?', render: (r) => (r.mustDo ? 'Yes' : 'No') },
    { key: 'responsible', label: 'Owner', render: (r) => r.responsible },
    { key: 'due', label: 'Due', render: (r) => r.dueDate ?? '—' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusPill tone={taskStatusTone(r.status)}>{choiceLabel(TASK_STATUS, r.status)}</StatusPill>,
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary-light btn-sm" onClick={() => setEditing(r)}>
            Edit
          </button>
          <button
            className="btn btn-secondary-light btn-sm"
            style={{ color: 'var(--danger-fg)' }}
            onClick={() => setDeleting(r)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Joining Tasks"
        subtitle="briqbi_joiningtasks — the checklist a new joiner's onboarding works through, stage by stage."
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)} disabled={members.length === 0}>
            Add Task
          </button>
        }
      />
      {error ? <p className="error">{error}</p> : <DataTable columns={columns} rows={rows} emptyText="No joining tasks yet." />}

      {showAdd && (
        <JoiningTaskFormModal
          members={members}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false)
            reload()
          }}
        />
      )}

      {editing && (
        <JoiningTaskFormModal
          task={editing}
          members={members}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            reload()
          }}
        />
      )}

      {deleting && (
        <Modal onClose={() => setDeleting(null)}>
          <button className="modal-close" onClick={() => setDeleting(null)} aria-label="Close">
            <CloseIcon style={{ width: 16, height: 16 }} />
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete this task?</h2>
          <p className="help" style={{ marginBottom: 20 }}>
            This removes the joining task permanently. This can't be undone.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary-light" style={{ flex: 1 }} onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, background: 'var(--danger-fg)' }}
              onClick={() => {
                void deleteJoiningTask(deleting.id).then(() => {
                  setDeleting(null)
                  reload()
                })
              }}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

function JoiningTaskFormModal({
  task,
  members,
  onClose,
  onSaved,
}: {
  task?: JoiningTask
  members: TeamMember[]
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = Boolean(task)
  const [teamMemberId, setTeamMemberId] = useState(task?.teamMemberId ?? '')
  const [stage, setStage] = useState(task ? String(task.stage) : '')
  const [status, setStatus] = useState(task ? String(task.status) : '0')
  const [mustDo, setMustDo] = useState(task?.mustDo ?? true)
  const [responsible, setResponsible] = useState(task?.responsible ?? '')
  const [sequence, setSequence] = useState(task ? String(task.sequence) : '1')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [completedDate, setCompletedDate] = useState(task?.completedDate ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!teamMemberId || stage === '' || !responsible) {
      setError('Person, stage, and owner are required.')
      return
    }
    setPending(true)
    try {
      if (isEdit && task) {
        await updateJoiningTask(task.id, {
          teamMemberId,
          stage: Number(stage),
          status: Number(status),
          mustDo,
          responsible,
          sequence: Number(sequence),
          dueDate: dueDate || undefined,
          completedDate: completedDate || undefined,
        })
      } else {
        await createJoiningTask({
          teamMemberId,
          stage: Number(stage),
          mustDo,
          responsible,
          sequence: Number(sequence),
          dueDate: dueDate || undefined,
        })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save joining task.')
      setPending(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon style={{ width: 16, height: 16 }} />
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{isEdit ? 'Edit Task' : 'Add Task'}</h2>
      <form className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
        <div className="field">
          <label htmlFor="teamMemberId">Person</label>
          <select id="teamMemberId" value={teamMemberId} onChange={(e) => setTeamMemberId(e.target.value)}>
            <option value="" disabled>
              Choose one
            </option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="stage">Stage</label>
          <select id="stage" value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="" disabled>
              Choose one
            </option>
            {ONBOARDING_STAGE.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="responsible">Owner</label>
          <input id="responsible" type="text" value={responsible} onChange={(e) => setResponsible(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="sequence">Sequence</label>
          <input id="sequence" type="number" min={1} value={sequence} onChange={(e) => setSequence(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="dueDate">Due Date</label>
          <input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="mustDo">
            <input
              id="mustDo"
              type="checkbox"
              checked={mustDo}
              onChange={(e) => setMustDo(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Must do
          </label>
        </div>
        {isEdit && (
          <>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {TASK_STATUS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="completedDate">Completed Date</label>
              <input
                id="completedDate"
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
              />
            </div>
          </>
        )}
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
          {pending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Task'}
        </button>
      </form>
    </Modal>
  )
}
