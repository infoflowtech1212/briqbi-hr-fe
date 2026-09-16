import cors from 'cors'
import express, { type Express } from 'express'
import { env } from './config/env'
import { healthRouter } from './routes/health.route'
import { sessionRouter } from './routes/session.route'
import { jobOpeningsRouter } from './routes/jobOpenings.route'
import { teamMembersRouter } from './routes/teamMembers.route'
import { assetsRouter } from './routes/assets.route'
import { trainingRecordsRouter } from './routes/trainingRecords.route'
import { joiningTasksRouter } from './routes/joiningTasks.route'

export function createApp(): Express {
  const app = express()

  app.use(cors({ origin: env.corsOrigin }))
  app.use(express.json())

  app.use('/api', healthRouter)
  app.use('/api', sessionRouter)
  app.use('/api', jobOpeningsRouter)
  app.use('/api', teamMembersRouter)
  app.use('/api', assetsRouter)
  app.use('/api', trainingRecordsRouter)
  app.use('/api', joiningTasksRouter)

  return app
}
