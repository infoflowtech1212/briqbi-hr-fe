import { useEffect, useState, type FormEvent } from 'react'
import { choiceLabel, DEPARTMENT, MEMBER_STATUS, PERSON_TYPE } from '@shared/optionSets'
import {
  createTeamMember,
  deleteTeamMember,
  fetchTeamMembers,
  updateTeamMember,
  type TeamMember,
} from '../../lib/api'
import { PageHeader, StatusPill } from '../../components/ui'
import { DataTable, type Column } from '../../components/DataTable'
import { Modal } from '../../components/Modal'
import { CloseIcon } from '../../components/icons'

export default function TeamMembersPage() {
  const [rows, setRows] = useState<TeamMember[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [deleting, setDeleting] = useState<TeamMember | null>(null)

  function reload() {
    fetchTeamMembers()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load team members'))
  }

  useEffect(reload, [])

  const columns: Column<TeamMember>[] = [
    { key: 'memberId', label: 'Member ID', render: (r) => <span className="mono">{r.memberId}</span> },
    { key: 'name', label: 'Name', render: (r) => r.fullName },
    { key: 'type', label: 'Type', render: (r) => choiceLabel(PERSON_TYPE, r.personType) },
    { key: 'dept', label: 'Department', render: (r) => choiceLabel(DEPARTMENT, r.department) },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <StatusPill tone={r.memberStatus === 3 ? 'danger' : r.memberStatus === 1 ? 'green' : 'blue'}>
          {choiceLabel(MEMBER_STATUS, r.memberStatus)}
        </StatusPill>
      ),
    },
    { key: 'email', label: 'Work Email', render: (r) => r.workEmail },
    {
      key: 'bgv',
      label: 'Check Overdue?',
      render: (r) => (r.bgvOverdue ? <StatusPill tone="danger">Overdue</StatusPill> : '—'),
    },
    { key: 'lastWorkingDay', label: 'Last Working Day', render: (r) => r.lastWorkingDay ?? '—' },
    { key: 'exitReason', label: 'Exit Reason', render: (r) => r.exitReason ?? '—' },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary-light btn-sm" onClick={() => setEditing(r)}>
            Edit
          </button>
          <button className="btn btn-secondary-light btn-sm" style={{ color: 'var(--danger-fg)' }} onClick={() => setDeleting(r)}>
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Team Members"
        subtitle="Every employee, consultant and intern on file."
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            Add Team Member
          </button>
        }
      />
      {error ? <p className="error">{error}</p> : <DataTable columns={columns} rows={rows} emptyText="No team members yet." />}

      {showAdd && (
        <TeamMemberFormModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false)
            reload()
          }}
        />
      )}

      {editing && (
        <TeamMemberFormModal
          member={editing}
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
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete {deleting.fullName}?</h2>
          <p className="help" style={{ marginBottom: 20 }}>
            This removes their Team Member record permanently. This can't be undone.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary-light" style={{ flex: 1 }} onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, background: 'var(--danger-fg)' }}
              onClick={() => {
                void deleteTeamMember(deleting.id).then(() => {
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

function TeamMemberFormModal({
  member,
  onClose,
  onSaved,
}: {
  member?: TeamMember
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = Boolean(member)
  const [fullName, setFullName] = useState(member?.fullName ?? '')
  const [personType, setPersonType] = useState(member ? String(member.personType) : '')
  const [department, setDepartment] = useState(member ? String(member.department) : '')
  const [workEmail, setWorkEmail] = useState(member?.workEmail ?? '')
  const [memberStatus, setMemberStatus] = useState(member ? String(member.memberStatus) : '0')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!fullName || personType === '' || department === '' || !workEmail) {
      setError('All fields are required.')
      return
    }
    setPending(true)
    try {
      if (isEdit && member) {
        await updateTeamMember(member.id, {
          fullName,
          personType: Number(personType),
          department: Number(department),
          workEmail,
          memberStatus: Number(memberStatus),
        })
      } else {
        await createTeamMember({
          fullName,
          personType: Number(personType),
          department: Number(department),
          workEmail,
        })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save team member.')
      setPending(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon style={{ width: 16, height: 16 }} />
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{isEdit ? 'Edit Team Member' : 'Add Team Member'}</h2>
      <p className="help" style={{ marginBottom: 20 }}>
        {isEdit
          ? 'Member ID stays fixed once assigned.'
          : 'Member ID is assigned automatically. Personal details, PAN, and bank info come later through the joiner form.'}
      </p>
      <form className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
        <div className="field">
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="personType">Person Type</label>
          <select id="personType" value={personType} onChange={(e) => setPersonType(e.target.value)}>
            <option value="" disabled>
              Choose one
            </option>
            {PERSON_TYPE.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="department">Department</label>
          <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="" disabled>
              Choose one
            </option>
            {DEPARTMENT.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="workEmail">Work Email</label>
          <input id="workEmail" type="email" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} />
        </div>
        {isEdit && (
          <div className="field">
            <label htmlFor="memberStatus">Status</label>
            <select id="memberStatus" value={memberStatus} onChange={(e) => setMemberStatus(e.target.value)}>
              {MEMBER_STATUS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
          {pending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Team Member'}
        </button>
      </form>
    </Modal>
  )
}
