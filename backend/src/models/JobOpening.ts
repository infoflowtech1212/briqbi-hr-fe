import { Schema, model, type InferSchemaType } from 'mongoose'

/**
 * Job Openings, synced from the real careers API at
 * https://api.intranet.briqbi.com/api/job-postings (see
 * src/services/jobPostingsSync.ts) — this is real production data, not a
 * mock. Shape follows the source API's fields directly rather than the
 * handover doc's briqbi_jobopening columns (no numeric department/status
 * choices there, no "positions" count — just what the careers site has).
 */
const jobOpeningSchema = new Schema(
  {
    externalId: { type: String, unique: true, sparse: true }, // the source API's _id
    role: { type: String, required: true },
    description: String,
    department: String,
    companyName: String,
    location: String,
    employmentType: String,
    isActive: { type: Boolean, default: true },
    experienceRequired: Number,
    skills: [String],
    postedAt: Date, // the source API's createdAt
  },
  { timestamps: true },
)

export type JobOpening = InferSchemaType<typeof jobOpeningSchema>
export const JobOpeningModel = model('JobOpening', jobOpeningSchema)
