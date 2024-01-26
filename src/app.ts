import { json } from 'body-parser'
import { config } from 'dotenv'
import express, { Application, Request, Response } from 'express'
import { createServer } from 'http'
import 'reflect-metadata'
import { Server } from 'socket.io'
import { MessageController } from './controllers'
import appConfigRouter from './routes/app.config.routes'
import authRouter from './routes/auth.routes'
import userRouter from './routes/user.routes'
import { InitDatabase } from './util/database'
import Log from './util/logger'

const app: Application = express()
const port: Number = 3000
const httpServer = createServer(app)
const socketServer = new Server(httpServer, {
  cors: { origin: '*' }
})
Log.createInstance()

config()

const messageController: MessageController = new MessageController()
messageController.webSocketServer = socketServer
messageController.init()

app.use(json())

app.get('/', async (req: Request, res: Response) => {
  Log.debug('/ request received')
  return res.status(200).send({
    message: 'Hello World!'
  })
})

app.use('/auth', authRouter)
app.use('/user', userRouter)
app.use('/config', appConfigRouter)

try {
  InitDatabase()
  httpServer.listen(port, (): void => {
    Log.debug(`Connected successfully on port ${port}`)
  })
} catch (error) {
  Log.debug(`Error occured: ${error.message}`)
}
