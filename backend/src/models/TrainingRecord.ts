import { Schema, model, type InferSchemaType } from 'mongoose'

/**
 * Mirrors briqbi_trainingrecords from the handover doc — required and
 * certification training assigned to a team member, with expiry tracked.
 */
const trainingRecordSchema = new Schema(
  {
    teamMemberId: { type: Schema.Types.ObjectId, ref: 'TeamMember', required: true },
    trainingType: { type: Number, required: true }, // briqbi_trainingtype
    trainingStatus: { type: Number, required: true, default: 0 }, // briqbi_trainingstatus
    provider: String,
    completedDate: Date,
    expiryDate: Date,
  },
  { timestamps: true },
)

export type TrainingRecord = InferSchemaType<typeof trainingRecordSchema>
export const TrainingRecordModel = model('TrainingRecord', trainingRecordSchema)
