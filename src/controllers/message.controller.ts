import { WebSocketServer } from 'ws'
import Log from '../util/logger'
import { Server, Socket } from 'socket.io'
import { autoInjectable, inject, injectable } from 'tsyringe'
import MessageService from '../services/message.service'
import { AuthService } from '../services'
import {
  AcknowledgeResponse,
  DeliveredRequest,
  ReadRequest,
  Message,
  MessageRequest,
  MessageSchema,
  MessageResponse,
  MessageStatus
} from '../interfaces/message.interface'
import { JwtPayload, decode } from 'jsonwebtoken'
import { UIMessage } from '../constants/ui.message.constants'
import { SocketEvent } from '../constants/socket.event.constants'
import { UpdateResult } from 'mongodb'
@autoInjectable()
export default class MessageController {
  public webSocketServer: Server

  constructor(
    @inject(MessageService)
    private messageService?: MessageService,
    @inject(AuthService)
    private authService?: AuthService
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

      socket.send('id : ' + socket.id)

      this.addChatListener(socket)
      this.addOnDeliveredListener(socket)
      this.addOnReadListener(socket)
      this.addOnCloseListener(socket)
    })
  }

  private addChatListener(socket: Socket) {
    socket.on('chat', async (data) => {
      Log.info('message received')
      const messageRequest: MessageRequest = JSON.parse(data)
      Log.info('message: ', { messageRequest })
      const sender = this.messageService.getUser(messageRequest.sender)
      const receiver = this.messageService.getUser(messageRequest.receiver)

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
            source: messageRequest.sender,
            destination: messageRequest.receiver,
            destinationType: messageRequest.destinationType,
            content: messageRequest.content,
            messageType: messageRequest.messageType,
            sentAt: messageRequest.sentAt,
            messageStatus: MessageStatus.SENT
          }
          this.webSocketServer.to(receiver).emit('chat', messageResponse)

          const messageAckowledge: AcknowledgeResponse = {
            messageId: message.id,
            requestId: messageRequest.requestId
          }
          socket.emit(SocketEvent.ACKNOWLEDGE, messageAckowledge)
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
        Log.info('message received')
        const deliveredRequest: DeliveredRequest = JSON.parse(data)
        const requester = this.messageService.getUser(
          deliveredRequest.acknowledgedBy
        )

        if (requester != socket.id) {
          // socket.send() // Todo: Send Error
          Log.error(UIMessage.UNAUTHORIZED)
          return
        }

        const sender = this.messageService.getUser(deliveredRequest.source)
        const message = this.messageService.getMessage(
          deliveredRequest.messageId
        )
        // Todo: Error handling - if(!sender) error if(!message) error
        if (sender && message) {
          const result: UpdateResult = await this.messageService.updateMessage({
            messageId: deliveredRequest.messageId,
            delivered: true,
            receivedAt: deliveredRequest.deliveredAt
          })
          Log.debug('updateResult', result)
          if (result.modifiedCount == 1) {
            this.webSocketServer
              .to(sender)
              .emit(SocketEvent.DELIVERED, deliveredRequest)
            Log.debug('delivery update', { sender, deliveredRequest })
          }
        } else {
          // Handle Error
          Log.error('MessageDeliveryError', 'Unkown')
        }
      } catch (e) {
        Log.error('MessageDeliveryError', { message: e.message })
      }
    })
  }

  private addOnCloseListener(socket: Socket) {
    socket.on('close', () => {
      Log.info('connection closed', socket.id)
      this.messageService.deleteUser(socket.id)
    })
  }

  addOnReadListener(socket: Socket) {
    socket.on(SocketEvent.READ, async (data) => {
      try {
        Log.info('message received')
        const readRequest: ReadRequest = JSON.parse(data)
        const requester = this.messageService.getUser(
          readRequest.acknowledgedBy
        )

        if (requester != socket.id) {
          // socket.send() // Todo: Send Error
          Log.error(UIMessage.UNAUTHORIZED)
          return
        }

        const sender = this.messageService.getUser(readRequest.source)
        const message = this.messageService.getMessage(readRequest.messageId)
        // Todo: Error handling - if(!sender) error if(!message) error
        if (sender && message) {
          const result: UpdateResult = await this.messageService.updateMessage({
            messageId: readRequest.messageId,
            read: true,
            readAt: readRequest.readAt
          })
          if (result.modifiedCount == 1) {
            this.webSocketServer.to(sender).emit(SocketEvent.READ, readRequest)
          }
        } else {
          // Handle Error
          Log.error('MessageDeliveryError', 'Unkown')
        }
      } catch (e) {
        Log.error('MessageDeliveryError', { message: e.message })
      }
    })
  }
}
