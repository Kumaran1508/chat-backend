import { Model, Schema, model } from 'mongoose'
import { singleton } from 'tsyringe'
import {
  MessageSchema
} from '../interfaces/message.interface'
import ModelI from '../interfaces/model.interface'

@singleton()
export default class MessageModel implements ModelI {
  schema: Schema<any> = new Schema(
    {
      source: {
        type: String,
        required: true
      },
      destination: {
        type: String,
        required: true
      },
      destinationType: {
        type: Number, // set min,max or validate
        required: true
      },
      delivered: {
        type: Boolean,
        required: false,
        default: false
      },
      isRead: {
        type: Boolean,
        required: true,
        default: false
      },
      messageType: {
        type: Number,
        required: true
      },
      hasAttachment: {
        type: Boolean,
        required: true
      },
      sentAt: {
        type: Date,
        required: true
      },
      receivedAt: {
        type: Date,
        required: false
      },
      readAt: {
        type: Date,
        required: false
      },
      edited: {
        type: Boolean,
        required: false,
        default: false
      },
      content: {
        type: String,
        required: true
      },
      attachmentId: {
        type: String,
        required: false
      },
      isForwarded: {
        type: Boolean,
        required: false
      },
      messageStatus: {
        type: Number,
        required: false,
        default: 2
      },
      isReply: {
        type: Boolean,
        required: false,
        default: false
      },
      replyOf: {
        type: String,
        required: false
      }
    },
    {
      timestamps: true
    }
  )
  model: Model<any, any> = model<MessageSchema>('message', this.schema)
}
