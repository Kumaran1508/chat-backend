import { ObjectId } from 'mongodb'
import { injectable } from 'tsyringe'
import { MessageSchema, MessageUpdate } from '../interfaces/message.interface'
import MessageModel from '../model/messge.model'
import BaseDao from './base.dao'

@injectable()
export default class MessageDao extends BaseDao<MessageSchema> {
  constructor(model?: MessageModel) {
    super(model)
  }

  public async update(message: MessageUpdate) {
    const { ['messageId']: messageId, ...update } = message

    return this.model.updateOne(
      {
        _id: new ObjectId(message.messageId)
      },
      update
    )
  }

  public async getNotDeliveredMessagesByUsername(
    username: string
  ): Promise<MessageSchema[]> {
    return this.model.find({
      destination: username,
      delivered: false
    })
  }
}
