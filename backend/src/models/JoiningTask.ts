import { Schema, model, type InferSchemaType } from 'mongoose'

/**
 * Mirrors briqbi_joiningtasks from the handover doc — the checklist items a
 * new joiner's onboarding flow works through, one row per task per stage.
 */
const joiningTaskSchema = new Schema(
  {
    teamMemberId: { type: Schema.Types.ObjectId, ref: 'TeamMember', required: true },
    stage: { type: Number, required: true }, // briqbi_stage
    status: { type: Number, required: true, default: 0 }, // briqbi_taskstatus
    mustDo: { type: Boolean, default: true },
    responsible: { type: String, required: true },
    sequence: { type: Number, required: true, default: 1 },
    dueDate: Date,
    completedDate: Date,
  },
  { timestamps: true },
)

export type JoiningTask = InferSchemaType<typeof joiningTaskSchema>
export const JoiningTaskModel = model('JoiningTask', joiningTaskSchema)
