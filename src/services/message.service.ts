import { inject, injectable } from 'tsyringe'
import UserService from './user.service'
import MessageDao from '../dao/message.dao'
import Log from '../util/logger'
import { Server } from 'socket.io'
import {
  Message,
  MessageDestinationType,
  MessageRequest,
  MessageSchema,
  MessageType,
  MessageUpdate
} from '../interfaces/message.interface'
import { ObjectId } from 'mongodb'
import { Schema } from 'mongoose'

@injectable()
export default class MessageService {
  private userList: Map<string, string> = new Map()

  constructor(
    @inject(MessageDao)
    private messageDao: MessageDao
  ) {}

  addUser(username: string, socketId: string) {
    this.userList.set(username, socketId)
    console.log(this.userList)
  }

  /**
   * @param username
   * @returns socketId of the user
   */
  getUser(username: string) {
    return this.userList.get(username)
  }

  deleteUser(username: string) {
    for (let [key, value] of this.userList.entries()) {
      if (value === username) this.userList.delete(key)
    }
  }

  async addMessage(message: MessageRequest) {
    /**
     *  1. Check if destination is right.
     *  2. Check if the user has permissions to send message to the destination.
     *  3. Check if the message sent time is in past
     *  4. Check the receiver type.
     */

    const messageDocument: any = {
      source: message.sender,
      destination: message.receiver,
      destinationType: message.destinationType,
      delivered: false,
      read: false,
      messageType: message.messageType,
      hasAttachment: message.hasAttachment,
      sentAt: message.sentAt,
      receivedAt: undefined,
      readAt: undefined,
      edited: false,
      content: message.content
    }
    const result = await this.messageDao.create(messageDocument)
    return result
  }

  async updateMessage(message: MessageUpdate) {
    try {
      const result = await this.messageDao.update(message)
      return result
    } catch (error) {
      Log.error('Error at MessageService.updateMessage')
      throw error
    }
  }

  async getMessage(messageId: string) {
    try {
      const id = new Schema.Types.ObjectId(messageId)
      Log.debug('id', id)
      const result = await this.messageDao.getById(id)
      Log.debug('getResult', result)
      return result
    } catch (error) {
      Log.error('error at MessageService.getMessage')
      throw error
    }
  }
}
