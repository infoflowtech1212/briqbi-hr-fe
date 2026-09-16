import { Schema, model, type InferSchemaType } from 'mongoose'

/**
 * Mirrors briqbi_teammember from the handover doc. First of the 10 models —
 * proves the Mongoose/Express wiring end to end; the other 9 tables
 * (Background Check, Document, Joining Task, Asset, Job Opening, Candidate,
 * Interview, Offer, Training Record) follow the same shape when it's their
 * turn, replacing the equivalent types in frontend/src/lib/mockApi.ts.
 */
const teamMemberSchema = new Schema(
  {
    memberId: { type: String, required: true, unique: true }, // EMP-1001 style
    fullName: { type: String, required: true },
    personType: { type: Number, required: true }, // briqbi_persontype
    memberStatus: { type: Number, required: true, default: 0 }, // briqbi_memberstatus
    onboardingStage: { type: Number, required: true, default: 0 }, // briqbi_stage
    department: { type: Number, required: true }, // briqbi_department
    workEmail: { type: String, required: true },
    personalEmail: String,
    phone: String,
    emergencyContact: String,
    pan: String, // secured column in Dataverse — mask in any list response
    bankAccountRef: String, // secured column in Dataverse — mask in any list response
    bgvOverdue: { type: Boolean, default: false },
    exitReason: String,
    lastWorkingDay: Date,
  },
  { timestamps: true },
)

export type TeamMember = InferSchemaType<typeof teamMemberSchema>
export const TeamMemberModel = model('TeamMember', teamMemberSchema)
