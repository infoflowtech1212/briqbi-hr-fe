import { createApp } from './app'
import { connectDb } from './db/connect'
import { env } from './config/env'
import { syncJobOpenings } from './services/jobPostingsSync'

async function main() {
  await connectDb()
  console.log('MongoDB connected:', env.mongoUri)

  syncJobOpenings()
    .then(({ synced, total }) => console.log(`Job openings synced: ${synced}/${total}`))
    .catch((err) => console.warn('Job openings sync failed on startup (will retry via POST /api/job-openings/sync):', err.message))

  const app = createApp()
  app.listen(env.port, () => {
    console.log(`Briqbi HR backend listening on :${env.port}`)
  })
}

main().catch((err) => {
  console.error('Failed to start server', err)
  process.exit(1)
})
