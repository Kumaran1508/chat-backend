import { JwtPayload, decode } from 'jsonwebtoken'
import { UpdateResult } from 'mongodb'
import { Server, Socket } from 'socket.io'
import { autoInjectable, inject } from 'tsyringe'
import { SocketEvent } from '../constants/socket.event.constants'
import { UIMessage } from '../constants/ui.message.constants'
import {
  AcknowledgeResponse,
  DeliveredRequest,
  MessageRequest,
  MessageResponse,
  MessageStatus,
  ReadRequest
} from '../interfaces/message.interface'
import { AuthService } from '../services'
import MessageService from '../services/message.service'
import UserService from '../services/user.service'
import Log from '../util/logger'
@autoInjectable()
export default class MessageController {
  public webSocketServer: Server

  constructor(
    @inject(MessageService)
    private messageService?: MessageService,
    @inject(AuthService)
    private authService?: AuthService,
    @inject(UserService)
    private userService?: UserService
  ) {}

  public init() {
    this.webSocketServer.use(async (socket, next) => {
      Log.info('Authenticating User')
      const token = socket.request.headers.authorization
      if (token) {
        Log.debug('Token ' + token)
        try {
          const auth = await this.authService.authenticate(token.split(' ')[1])
          if (auth) next()
          else throw Error(UIMessage.UNAUTHORIZED)
        } catch (error) {
          Log.info(UIMessage.UNAUTHORIZED)
          socket.disconnect(true)
        }
      } else {
        Log.info(UIMessage.UNAUTHORIZED)
        socket.disconnect(true)
      }
    })

    this.webSocketServer.on('connection', async (socket) => {
      Log.info('Socket Connnection established')

      const token = socket.request.headers.authorization
      const username = await (decode(token.split(' ')[1]) as JwtPayload)[
        'username'
      ]
      Log.debug('decoded user', { username })
      this.messageService.addUser(username, socket.id)

      // Listen for the reconnection event
      socket.on('reconnect', (attemptNumber) => {
        console.log(
          `Reconnected after ${attemptNumber} attempts with ID: ${socket.id}`
        )

        // Update the stored socket.id or perform any other actions needed
        this.messageService.addUser(username, socket.id)
      })

      socket.send('id : ' + socket.id)

      this.addChatListener(socket)
      this.addOnDeliveredListener(socket)
      this.addOnReadListener(socket)
      this.addOnCloseListener(socket)
      this.addOnQueueListener(socket, username)
    })
  }

  private async addOnQueueListener(socket: Socket, username: string) {
    socket.on('queue', async (data) => {
      this.sendQueuedMessages(socket, username)
    })
  }

  private async sendQueuedMessages(socket: Socket, username: string) {
    try {
      const undeliveredMessages =
        await this.messageService.getNotDeliveredMessagesByUsername(username)
      const chunk = undeliveredMessages.slice(0, 50)
      const preparedChunk = chunk.map((message) => ({
        messageId: message.id,
        source: message.source,
        destination: message.destination,
        destinationType: message.destinationType,
        content: message.content,
        messageType: message.messageType,
        sentAt: message.sentAt,
        messageStatus: message.messageStatus
      }))
      socket.emit('queue', preparedChunk)
      Log.debug('chunk', preparedChunk.length)
    } catch (e) {
      Log.error('sendQueuedMessages', e.message)
    }
  }

  private addChatListener(socket: Socket) {
    socket.on('chat', async (data) => {
      Log.info('message received')
      const messageRequest: MessageRequest = JSON.parse(data)
      Log.info('message: ', { messageRequest })
      const sender = this.messageService.getUser(messageRequest.source)
      const receiver = this.userService.findUserByUsername(
        messageRequest.destination
      )

      // Log.debug("authorization: ",socket.request.headers.authorization)
      if (sender != socket.id) {
        Log.debug('socket mismatch', { sender: sender, socket: socket.id })
        // socket.send() // Todo: Send Error
        Log.error(UIMessage.UNAUTHORIZED)
        return
      }

      if (receiver) {
        try {
          const message = await this.messageService.addMessage(messageRequest)
          var messageResponse: MessageResponse = {
            messageId: message.id,
            source: messageRequest.source,
            destination: messageRequest.destination,
            destinationType: messageRequest.destinationType,
            content: messageRequest.content,
            messageType: messageRequest.messageType,
            sentAt: messageRequest.sentAt,
            messageStatus: MessageStatus.SENT
          }

          const messageAckowledge: AcknowledgeResponse = {
            messageId: message.id,
            requestId: messageRequest.requestId
          }
          socket.emit(SocketEvent.ACKNOWLEDGE, messageAckowledge)
          Log.debug('acknowledging to', { socket: socket.id })

          const destination = this.messageService.getUser(
            messageRequest.destination
          )
          Log.debug('destination', destination)
          if (destination)
            this.webSocketServer.to(destination).emit('chat', messageResponse)
          else Log.warn('SocketError', 'User not connected')
        } catch (e) {
          socket.send('Error sending message', e.message)
        }
      } else {
        socket.send(`Not sent! User not found`)
      }
    })
  }

  private addOnDeliveredListener(socket: Socket) {
    socket.on(SocketEvent.DELIVERED, async (data) => {
      try {
        Log.info('delivery request received', data)
        const deliveredRequest: DeliveredRequest = JSON.parse(data)

        const requester = this.messageService.getUser(
          deliveredRequest.acknowledgedBy
        )

        if (requester != socket.id) {
          // socket.send() // Todo: Send Error
          Log.error(UIMessage.UNAUTHORIZED)
          return
        }

        const sender = this.userService.findUserByUsername(
          deliveredRequest.source
        )
        const message = this.messageService.getMessage(
          deliveredRequest.messageId
        )
        // Todo: Error handling - if(!sender) error if(!message) error
        if (sender && message) {
          const result: UpdateResult = await this.messageService.updateMessage({
            messageId: deliveredRequest.messageId,
            delivered: true,
            receivedAt: deliveredRequest.deliveredAt,
            messageStatus: MessageStatus.DELIVERED
          })
          Log.debug('updateResult', result)
          const senderSocketId = this.messageService.getUser(
            deliveredRequest.source
          )
          if (result.modifiedCount == 1) {
            this.webSocketServer
              .to(senderSocketId)
              .emit(SocketEvent.DELIVERED, deliveredRequest)
            Log.debug('delivery update', { sender, deliveredRequest })
          }
        } else {
          // Handle Error
          if (!sender)
            Log.error('MessageDeliveryError', {
              message: 'Source not found',
              source: deliveredRequest.source
            })
          else if (!message)
            Log.error('MessageDeliveryError', {
              message: 'Message not found',
              source: deliveredRequest.messageId
            })
          else Log.error('MessageDeliveryError', { message: 'Unknown Error' })
        }
      } catch (e) {
        Log.error('MessageDeliveryError4', { message: e.message })
      }
    })
  }

  private addOnCloseListener(socket: Socket) {
    socket.on('disconnect', () => {
      Log.info('connection closed', socket.id)
      this.messageService.deleteUser(socket.id)
    })
  }

  private addOnReadListener(socket: Socket) {
    socket.on(SocketEvent.READ, async (data) => {
      try {
        Log.info('read request received')
        const readRequest: ReadRequest = JSON.parse(data)
        const requester = this.messageService.getUser(
          readRequest.acknowledgedBy
        )

        if (requester != socket.id) {
          // socket.send() // Todo: Send Error
          Log.error(UIMessage.UNAUTHORIZED)
          return
        }

        const sender = this.userService.findUserByUsername(readRequest.source)
        const message = this.messageService.getMessage(readRequest.messageId)
        // Todo: Error handling - if(!sender) error if(!message) error
        if (sender && message) {
          const result: UpdateResult = await this.messageService.updateMessage({
            messageId: readRequest.messageId,
            read: true,
            readAt: readRequest.readAt,
            messageStatus: MessageStatus.READ,
            delivered: true
          })
          const senderSocketId = this.messageService.getUser(readRequest.source)
          if (result.modifiedCount == 1) {
            this.webSocketServer
              .to([senderSocketId, requester])
              .emit(SocketEvent.READ, readRequest)
          }
        } else {
          // Handle Error
          if (!sender)
            Log.error('MessageReadError', {
              message: 'Source not found',
              source: readRequest.source
            })
          else if (!message)
            Log.error('MessageReadError', {
              message: 'Message not found',
              source: readRequest.messageId
            })
          else Log.error('MessageReadError', { message: 'Unknown Error' })
        }
      } catch (e) {
        Log.error('MessageReadError', { message: e.message })
      }
    })
  }
}
