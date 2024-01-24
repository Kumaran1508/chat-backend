import { injectable } from 'tsyringe'
import BaseDao from './base.dao'
import MessageModel from '../model/messge.model'
import { MessageSchema, MessageUpdate } from '../interfaces/message.interface'
import { ObjectId } from 'mongodb'

@injectable()
export default class MessageDao extends BaseDao<MessageSchema> {
  public async update(message: MessageUpdate) {
    const { ['messageId']: messageId, ...update } = message

    return this.model.updateOne(
      {
        _id: new ObjectId(message.messageId)
      },
      update
    )
  }

  constructor(model?: MessageModel) {
    super(model)
  }
}
