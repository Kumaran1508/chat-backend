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
        _id: new ObjectId(messageId)
      },
      update
    )
  }

  public async getUpdatedMessages(
    username: string,
    lastOnline: Date
  ): Promise<MessageSchema[]> {
    return this.model.find({
      $or: [{ source: username }, { destination: username }],
      updatedAt: { $gte: lastOnline }
    })
  }
}
