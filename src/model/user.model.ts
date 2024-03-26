import { Model, Schema, model } from 'mongoose'
import { singleton } from 'tsyringe'
import ModelI from '../interfaces/model.interface'
import UserSchema from '../interfaces/user.interface'

@singleton()
export default class UserModel implements ModelI {
  schema: Schema<any> = new Schema(
    {
      displayName: {
        type: String,
        required: false,
        default: 'Unknown'
      },
      mobileNumber: {
        type: String,
        required: true
      },
      username: {
        type: String,
        required: true
      },
      profileUrl: {
        type: String,
        required: false
      },
      about: {
        type: String,
        reuired: false
      },
      lastOnline: {
        type: Date,
        required: false,
        default: new Date()
      },
      isOnline: {
        type: Boolean,
        required: true,
        default: false
      }
    },
    {
      timestamps: true
    }
  )
  model: Model<any, any> = model<UserSchema>('users', this.schema)
}
