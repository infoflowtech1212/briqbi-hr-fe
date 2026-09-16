import { Schema, model, type InferSchemaType } from 'mongoose'

/**
 * Mirrors briqbi_asset from the handover doc — kit issued to a team member,
 * its condition, and whether it's come back. Same CRUD shape as TeamMember.
 */
const assetSchema = new Schema(
  {
    teamMemberId: { type: Schema.Types.ObjectId, ref: 'TeamMember', required: true },
    assetType: { type: Number, required: true }, // briqbi_assettype
    status: { type: Number, required: true, default: 0 }, // briqbi_assetstatus
    serialNumber: String,
    conditionAtIssue: String,
  },
  { timestamps: true },
)

export type Asset = InferSchemaType<typeof assetSchema>
export const AssetModel = model('Asset', assetSchema)
