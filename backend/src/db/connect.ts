import mongoose from 'mongoose'
import { env } from '../config/env'

export async function connectDb(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true)
  return mongoose.connect(env.mongoUri)
}

export function dbState(): 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'uninitialized' {
  switch (mongoose.connection.readyState) {
    case 0:
      return 'disconnected'
    case 1:
      return 'connected'
    case 2:
      return 'connecting'
    case 3:
      return 'disconnecting'
    default:
      return 'uninitialized'
  }
}
