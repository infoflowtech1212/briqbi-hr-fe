/**
 * Global choices (option sets), transcribed from the Dataverse schema in the
 * developer handover doc. Publisher prefix is 10437 — values below are the
 * last three digits only; do not renumber, they are hard-coded against the
 * live Dataverse choice definitions.
 *
 * Sets marked INFERRED were not enumerated with explicit values in the
 * handover doc — verify against the live choice set before wiring real writes.
 */

export interface Choice {
  value: number
  label: string
}

export const PERSON_TYPE: Choice[] = [
  { value: 0, label: 'Employee' },
  { value: 1, label: 'Consultant' },
  { value: 2, label: 'Intern' },
]

export const MEMBER_STATUS: Choice[] = [
  { value: 0, label: 'Joining' },
  { value: 1, label: 'Active' },
  { value: 2, label: 'On Notice' },
  { value: 3, label: 'Left' },
]

export const DEPARTMENT: Choice[] = [
  { value: 0, label: 'Software Development' },
  { value: 1, label: 'Delivery' },
  { value: 2, label: 'Finance' },
  { value: 3, label: 'HR' },
  { value: 4, label: 'Marketing' },
  { value: 5, label: 'Management' },
]

export const ONBOARDING_STAGE: Choice[] = [
  { value: 0, label: 'Offer' },
  { value: 1, label: 'Before start' },
  { value: 2, label: 'Day one' },
  { value: 3, label: 'First week' },
  { value: 4, label: 'Check complete' },
  { value: 5, label: 'Review' },
  { value: 6, label: 'Settled' },
]

export const CHECK_STATUS: Choice[] = [
  { value: 0, label: 'Not started' },
  { value: 1, label: 'Consent pending' },
  { value: 2, label: 'In progress' },
  { value: 3, label: 'Done' },
  { value: 4, label: 'Overdue' },
]

export const CHECK_OUTCOME: Choice[] = [
  { value: 0, label: 'Waiting' },
  { value: 1, label: 'Clear' },
  { value: 2, label: 'Problem found' },
  { value: 3, label: 'Failed' },
]

/** INFERRED sequence — doc only confirms 3 Verified / 4 Rejected / 5 Expired / 6 Waived. */
export const DOC_STATUS: Choice[] = [
  { value: 0, label: 'Missing' },
  { value: 1, label: 'Received' },
  { value: 2, label: 'Sent for Signature' },
  { value: 3, label: 'Verified' },
  { value: 4, label: 'Rejected' },
  { value: 5, label: 'Expired' },
  { value: 6, label: 'Waived' },
]

export const DOC_TYPE: Choice[] = [
  { value: 0, label: 'PAN' },
  { value: 1, label: 'Aadhaar' },
  { value: 2, label: 'Address proof' },
  { value: 3, label: 'Photo' },
  { value: 4, label: 'Bank details and cheque' },
  { value: 5, label: 'Offer letter' },
  { value: 6, label: 'Employment agreement' },
  { value: 7, label: 'Consultancy agreement' },
  { value: 8, label: 'Internship agreement' },
  { value: 9, label: 'NDA and IP' },
  { value: 10, label: 'Check consent' },
  { value: 11, label: 'Education certificates' },
  { value: 12, label: 'Relieving letter' },
  { value: 13, label: 'Experience letter' },
  { value: 14, label: 'Last 3 payslips' },
  { value: 15, label: 'College enrolment' },
  { value: 16, label: 'GST registration' },
  { value: 17, label: 'Passport or visa' },
  { value: 18, label: 'PF UAN and nomination' },
  { value: 19, label: 'Policy acknowledgement' },
  { value: 20, label: '194J declaration' },
  { value: 21, label: 'Emergency contact' },
]

/** INFERRED — not enumerated in the doc. */
export const SIGNATURE_METHOD: Choice[] = [
  { value: 0, label: 'Typed name' },
  { value: 1, label: 'Uploaded scan' },
  { value: 2, label: 'DocuSign' },
]

export const TASK_STATUS: Choice[] = [
  { value: 0, label: 'Not started' },
  { value: 1, label: 'In progress' },
  { value: 2, label: 'Done' },
  { value: 3, label: 'Blocked' },
]

export const ASSET_TYPE: Choice[] = [
  { value: 0, label: 'Laptop' },
  { value: 1, label: 'Monitor' },
  { value: 2, label: 'Phone' },
  { value: 3, label: 'Access card' },
  { value: 4, label: 'Software licence' },
  { value: 5, label: 'Other' },
]

export const ASSET_STATUS: Choice[] = [
  { value: 0, label: 'In stock' },
  { value: 1, label: 'With them' },
  { value: 2, label: 'Due back' },
  { value: 3, label: 'Returned' },
  { value: 4, label: 'Lost or damaged' },
]

export const CANDIDATE_STAGE: Choice[] = [
  { value: 0, label: 'Applied' },
  { value: 1, label: 'Screening' },
  { value: 2, label: 'Interview' },
  { value: 3, label: 'Offer' },
  { value: 4, label: 'Hired' },
  { value: 5, label: 'Declined' },
  { value: 6, label: 'Withdrawn' },
  { value: 7, label: 'Rejected' },
]

export const OPENING_STATUS: Choice[] = [
  { value: 0, label: 'Open' },
  { value: 1, label: 'On hold' },
  { value: 2, label: 'Offer out' },
  { value: 3, label: 'Filled' },
  { value: 4, label: 'Closed' },
]

export const RECOMMENDATION: Choice[] = [
  { value: 0, label: 'Booked' },
  { value: 1, label: 'Strong yes' },
  { value: 2, label: 'Yes' },
  { value: 3, label: 'No' },
  { value: 4, label: 'Strong no' },
]

export const OFFER_STATUS: Choice[] = [
  { value: 0, label: 'Draft' },
  { value: 1, label: 'Sent' },
  { value: 2, label: 'Waiting' },
  { value: 3, label: 'Accepted' },
  { value: 4, label: 'Declined' },
  { value: 5, label: 'Expired' },
  { value: 6, label: 'Withdrawn' },
]

export const TRAINING_TYPE: Choice[] = [
  { value: 0, label: 'Required' },
  { value: 1, label: 'Certification' },
  { value: 2, label: 'Client' },
]

export const TRAINING_STATUS: Choice[] = [
  { value: 0, label: 'Not started' },
  { value: 1, label: 'In progress' },
  { value: 2, label: 'Done' },
  { value: 3, label: 'Certified' },
  { value: 4, label: 'Expiring' },
  { value: 5, label: 'Expired' },
]

/** INFERRED — not enumerated in the doc. */
export const APPLICATION_SOURCE: Choice[] = [
  { value: 0, label: 'Referral' },
  { value: 1, label: 'LinkedIn' },
  { value: 2, label: 'Job board' },
  { value: 3, label: 'Company website' },
  { value: 4, label: 'Other' },
]

/** INFERRED — not enumerated in the doc. */
export const CHECK_PROVIDER: Choice[] = [
  { value: 0, label: 'IDfy' },
  { value: 1, label: 'SpringVerify' },
  { value: 2, label: 'AuthBridge' },
  { value: 3, label: 'Manual / other' },
]

export function choiceLabel(set: Choice[], value: number): string {
  return set.find((c) => c.value === value)?.label ?? 'Unknown'
}
