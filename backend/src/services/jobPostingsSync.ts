import { JobOpeningModel } from '../models/JobOpening'

const SOURCE_URL = 'https://api.intranet.briqbi.com/api/job-postings'
const PAGE_SIZE = 50

interface ExternalJobPosting {
  _id: string
  role: string
  description: string
  department: string
  companyName: string
  location: string
  employmentType: string
  isActive: boolean
  experienceRequired: number
  skills: string[]
  createdAt: string
  updatedAt: string
}

interface ExternalResponse {
  data: ExternalJobPosting[]
  total: number
  page: number
  totalPages: number
}

/** Pulls every page from the real careers API and upserts each posting by its externalId. */
export async function syncJobOpenings(): Promise<{ synced: number; total: number }> {
  let page = 1
  let totalPages = 1
  let synced = 0
  let total = 0

  do {
    const res = await fetch(`${SOURCE_URL}?page=${page}&limit=${PAGE_SIZE}`)
    if (!res.ok) {
      throw new Error(`Job postings source responded ${res.status}`)
    }
    const body = (await res.json()) as ExternalResponse
    total = body.total

    for (const item of body.data) {
      await JobOpeningModel.updateOne(
        { externalId: item._id },
        {
          $set: {
            externalId: item._id,
            role: item.role,
            description: item.description,
            department: item.department,
            companyName: item.companyName,
            location: item.location,
            employmentType: item.employmentType,
            isActive: item.isActive,
            experienceRequired: item.experienceRequired,
            skills: item.skills,
            postedAt: new Date(item.createdAt),
          },
        },
        { upsert: true },
      )
      synced++
    }

    totalPages = body.totalPages
    page++
  } while (page <= totalPages)

  return { synced, total }
}
