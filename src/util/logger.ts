import { config } from 'dotenv'
import { Logger, createLogger, format, transports } from 'winston'
import { StreamTransportInstance } from 'winston/lib/winston/transports'
import { Environment } from '../constants/environment.constants'

export default class Log {
  private static logger: Logger
  transportList: StreamTransportInstance[] = []

  // Custom format for local timestamp
  private localTimestampFormat = () => {
    return new Date().toLocaleString()
  }

  private constructor() {
    config()
    const environment = process.env[Environment.APP_ENVIRONMENT]

    switch (environment) {
      case 'local': {
        this.transportList = [new transports.Console({ level: 'debug' })]
      }
      case 'development': {
        this.transportList = [
          new transports.Console({ level: 'debug' }),
          new transports.File({ filename: 'logs/error.log', level: 'error' })
        ]
      }
      case 'production': {
        this.transportList = [
          new transports.Console({ level: 'info' }),
          new transports.File({ filename: 'logs/error.log', level: 'error' }),
          new transports.File({ filename: 'logs/debug.log', level: 'debug' })
        ]
      }
      default: {
        this.transportList = [
          new transports.Console({ level: 'debug' }),
          new transports.File({ filename: 'logs/error.log', level: 'error' })
        ]
      }
    }

    Log.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({ format: this.localTimestampFormat }),
        format.colorize(),
        format.simple()
      ),
      transports: this.transportList
    })
  }

  public static createInstance() {
    if (Log.logger == null) new Log()
  }

  public static debug(message: string, data?: any) {
    this.logger.debug(message, data)
  }

  public static info(message: string, data?: any) {
    this.logger.info(message, data)
  }

  public static warn(message: string, data?: any) {
    this.logger.warn(message, data)
  }

  public static error(message: string, data?: any) {
    this.logger.error(message, data)
  }
}

module.exports = Log
