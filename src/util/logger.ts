import { createLogger,format,transports,Logger,level, info } from "winston";

export default class Log {
    private static logger : Logger;

    private constructor() {
        Log.logger = createLogger({
            level: 'info',
            format: format.combine(
                format.timestamp(),
                format.colorize(),
                format.simple()
            ),
            transports: [
              new transports.Console({level:'debug'}),
              new transports.File({ filename: 'logs/error.log', level: 'error' }),
              new transports.File({ filename: 'logs/debug.log', level: 'debug' }),
              new transports.File({ filename: 'logs/combined.log' })
            ]
          });
    }

    public static createInstance() {
        if(Log.logger == null) 
            new Log();
    }

    public static debug(message:string){
        this.logger.debug(message);
    }

    public static info(message:string){
        this.logger.info(message);
    }

    public static warn(message:string){
        this.logger.warn(message);
    }

    public static error(message:string){
        this.logger.error(message);
    }


}

module.exports = Log;