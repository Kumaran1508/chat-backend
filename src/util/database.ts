import { Environment } from '../constants/environment.constants'
import Log from './logger'
import { config } from 'dotenv'
import mongoose from 'mongoose'

config()
const db_url = process.env[Environment.DB_CONNECTION_STRING]
const connectionOptions: mongoose.ConnectOptions = {
  maxPoolSize: 50,
  dbName: 'ping'
}

export const InitDatabase = async () => {
  try {
    Log.info(`url : ${db_url}`)
    await mongoose.connect(db_url, connectionOptions)
    Log.info('Connected to Database')
  } catch (error) {
    Log.error('Error Connecting to Database : ' + error.message)
    Log.info('Stopping Application')
    throw error
  }
}
