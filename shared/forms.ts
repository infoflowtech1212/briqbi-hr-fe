/**
 * The ten forms, defined once — per the handover doc, "One definition, both
 * sides": this file is the single source both `frontend/` (rendering) and
 * `backend/` (validation, once it exists) import from.
 */
import type { Choice } from './optionSets'
import {
  APPLICATION_SOURCE,
  RECOMMENDATION,
  SIGNATURE_METHOD,
} from './optionSets'

export type FormKey =
  | 'apply'
  | 'joiner'
  | 'documents'
  | 'consent'
  | 'policy'
  | 'asset'
  | 'offer'
  | 'interview'
  | 'reference'
  | 'exit'

/** Forms that are minted as a `/f/<token>` link from the console. `apply` is public and needs no link. */
export const LINKED_FORM_KEYS: FormKey[] = [
  'joiner',
  'documents',
  'consent',
  'policy',
  'asset',
  'offer',
  'interview',
  'reference',
  'exit',
]

export type ModuleAccent = 'blue' | 'green' | 'purple' | 'orange' | 'teal'

/** Who a minted link's subject picker should offer: a Team Member or a Candidate. */
export type SubjectKind = 'teamMember' | 'candidate'

export interface FormMeta {
  key: FormKey
  title: string
  who: string
  writesTo: string
  description: string
  /** Matches the nav group that owns the table this form writes to — see
   *  briqbi-hr-design-system.md §1: People=blue, Hiring=green, Checks=purple,
   *  Development=orange, Kit=teal. */
  accent: ModuleAccent
  subjectKind: SubjectKind | null
  /** Verb naming the action performed, e.g. "Submit consent" — never a bare "Continue" (§5). */
  submitLabel: string
  /** Restricts the console's subject picker to team members in one of these
   *  briqbi_memberstatus values (0 Joining, 1 Active, 2 On Notice, 3 Left) —
   *  matches the form's "who fills it" role, e.g. "new joiner" only lists
   *  people actually mid-onboarding. Only set when subjectKind is teamMember. */
  eligibleMemberStatuses?: number[]
  /** Same idea for candidate-scoped forms, restricted to briqbi_candidatestage
   *  values (0 Applied … 7 Rejected). */
  eligibleCandidateStages?: number[]
}

export const FORMS: Record<FormKey, FormMeta> = {
  apply: {
    key: 'apply',
    title: 'Apply',
    who: 'anyone — public',
    writesTo: 'Candidate + CV file',
    description: 'Job application. No account needed — a candidate has none.',
    accent: 'green', // Hiring
    subjectKind: null,
    submitLabel: 'Submit application',
  },
  joiner: {
    key: 'joiner',
    title: 'Joiner form',
    who: 'new joiner',
    writesTo: 'Team Member — personal, PAN, bank, emergency contact',
    description: 'The personal details we need on file before day one.',
    accent: 'blue', // People
    subjectKind: 'teamMember',
    submitLabel: 'Submit',
    eligibleMemberStatuses: [0], // Joining
  },
  documents: {
    key: 'documents',
    title: 'Documents',
    who: 'new joiner',
    writesTo: 'Document — uploads, flips Missing to Received',
    description: 'Upload each document we still need from you.',
    accent: 'purple', // Checks
    subjectKind: 'teamMember',
    submitLabel: 'Mark as received',
    eligibleMemberStatuses: [0], // Joining
  },
  consent: {
    key: 'consent',
    title: 'Background check consent',
    who: 'new joiner',
    writesTo: 'Background Check — consent flag, date, history in notes',
    description: 'Your consent to run a background verification check.',
    accent: 'purple', // Checks
    subjectKind: 'teamMember',
    submitLabel: 'Submit consent',
    eligibleMemberStatuses: [0], // Joining
  },
  policy: {
    key: 'policy',
    title: 'Policy acknowledgement',
    who: 'team member',
    writesTo: 'Document — policy acknowledgement verified and signed',
    description: 'Confirm you have read and agree to company policy.',
    accent: 'purple', // Checks
    subjectKind: 'teamMember',
    submitLabel: 'Sign and submit',
    eligibleMemberStatuses: [0, 1], // Joining or Active — anyone current
  },
  asset: {
    key: 'asset',
    title: 'Asset receipt',
    who: 'team member',
    writesTo: 'Asset — condition on receipt, status to With them',
    description: 'Confirm what you received and its condition.',
    accent: 'teal', // Kit
    subjectKind: 'teamMember',
    submitLabel: 'Confirm receipt',
    eligibleMemberStatuses: [0, 1], // Joining or Active — kit gets issued at either point
  },
  offer: {
    key: 'offer',
    title: 'Offer response',
    who: 'candidate',
    writesTo: 'Offer — accepted or declined, start date',
    description: 'Accept or decline, and confirm a start date.',
    accent: 'green', // Hiring
    subjectKind: 'candidate',
    submitLabel: 'Accept offer',
    eligibleCandidateStages: [3], // Offer
  },
  interview: {
    key: 'interview',
    title: 'Interview feedback',
    who: 'interviewer',
    writesTo: 'Interview — verdict and written feedback',
    description: 'Your verdict and written feedback on the candidate.',
    accent: 'green', // Hiring
    subjectKind: 'candidate',
    submitLabel: 'Submit feedback',
    eligibleCandidateStages: [1, 2], // Screening or Interview
  },
  reference: {
    key: 'reference',
    title: 'Reference check',
    who: 'previous employer',
    writesTo: 'Background Check — reference appended to notes',
    description: 'A reference for someone who listed you as a contact.',
    accent: 'purple', // Checks
    subjectKind: 'teamMember',
    submitLabel: 'Submit reference',
    eligibleMemberStatuses: [0], // Joining — reference checks run before/at start
  },
  exit: {
    key: 'exit',
    title: 'Exit form',
    who: 'leaver',
    writesTo: 'Team Member exit reason; flips their assets to Due back',
    description: 'Your exit reason and last working day.',
    accent: 'blue', // People
    subjectKind: 'teamMember',
    submitLabel: 'Submit exit details',
    eligibleMemberStatuses: [1, 2], // Active or On Notice — anyone currently employed
  },
}

export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'date'
  | 'number'
  | 'currency'
  | 'textarea'
  | 'checkbox'
  | 'select'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: Choice[]
  help?: string
  placeholder?: string
  /** Groups fields under a Sora section header (§2 "Section header"), e.g. "Bank & PAN". */
  section?: string
  /** Extra format check beyond required-ness; returns the fix to state, e.g.
   *  "PAN should be 10 characters, letters and numbers only." (§5 error state). */
  validate?: (raw: string) => string | undefined
}

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/i

function validatePan(raw: string): string | undefined {
  if (!PAN_PATTERN.test(raw.trim())) {
    return 'PAN should be 10 characters, letters and numbers only.'
  }
  return undefined
}

/**
 * Flat field schemas for the forms simple enough to render generically.
 * `documents` and `asset` are record lists (one action per existing row), not
 * flat fields, so they render through dedicated components instead.
 */
export const FORM_FIELDS: Partial<Record<FormKey, FieldDef[]>> = {
  apply: [
    { name: 'fullName', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'linkedin', label: 'LinkedIn or Portfolio', type: 'text' },
    { name: 'location', label: 'Where They Live', type: 'text' },
    { name: 'experienceYears', label: 'Years of Experience', type: 'number' },
    { name: 'currentPay', label: 'Current Pay', type: 'currency' },
    { name: 'expectedPay', label: 'Expected Pay', type: 'currency' },
    { name: 'noticePeriod', label: 'Notice Period', type: 'text' },
    { name: 'source', label: 'Came From', type: 'select', options: APPLICATION_SOURCE },
  ],
  joiner: [
    {
      name: 'personalEmail',
      label: 'Personal Email',
      type: 'email',
      required: true,
      section: 'Personal details',
    },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, section: 'Personal details' },
    {
      name: 'emergencyContact',
      label: 'Emergency Contact',
      type: 'text',
      required: true,
      placeholder: 'Name, relationship, phone number',
      section: 'Personal details',
    },
    {
      name: 'pan',
      label: 'PAN',
      type: 'text',
      required: true,
      help: 'As printed on your PAN card',
      section: 'Bank & PAN',
      validate: validatePan,
    },
    {
      name: 'bankAccountRef',
      label: 'Bank Account Ref',
      type: 'text',
      required: true,
      help: 'Account number and IFSC, for payroll',
      section: 'Bank & PAN',
    },
  ],
  consent: [
    {
      name: 'consentReceived',
      label: 'I consent to a background verification check',
      type: 'checkbox',
      required: true,
    },
    { name: 'notes', label: 'Notes', type: 'textarea', help: 'Anything you want on record' },
  ],
  policy: [
    { name: 'signatureMethod', label: 'Signature Method', type: 'select', options: SIGNATURE_METHOD, required: true },
    {
      name: 'signedName',
      label: 'Signed',
      type: 'text',
      required: true,
      help: 'Type your full legal name to sign',
    },
    {
      name: 'acknowledge',
      label: 'I have read and agree to the company policy',
      type: 'checkbox',
      required: true,
    },
  ],
  interview: [
    { name: 'round', label: 'Round', type: 'text', required: true, placeholder: 'e.g. Technical, Final' },
    { name: 'strengths', label: 'What Was Good', type: 'textarea' },
    { name: 'concerns', label: 'What Worried You', type: 'textarea' },
    { name: 'recommendation', label: 'Verdict', type: 'select', options: RECOMMENDATION, required: true },
  ],
  reference: [
    {
      name: 'referenceNotes',
      label: 'Your reference',
      type: 'textarea',
      required: true,
      help: "Appended to the candidate's background check notes",
    },
    {
      name: 'wouldRehire',
      label: 'Would you re-engage them?',
      type: 'select',
      options: [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' },
        { value: 2, label: 'Not sure' },
      ],
    },
  ],
  exit: [
    { name: 'exitReason', label: 'Exit Reason', type: 'textarea', required: true },
    { name: 'lastWorkingDay', label: 'Last Working Day', type: 'date', required: true },
  ],
}
