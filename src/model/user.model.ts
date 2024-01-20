import { Model, Schema, model } from 'mongoose'
import User from '../interfaces/user.interface'
import UserSchema from '../interfaces/user.interface'
import ModelI from '../interfaces/model.interface'
import { singleton } from 'tsyringe'

@singleton()
export default class UserModel implements ModelI {
  schema: Schema<any> = new Schema(
    {
      display_name: {
        type: String,
        required: false,
        default: 'Unknown'
      },
      mobile_number: {
        type: String,
        required: true
      },
      username: {
        type: String,
        required: true
      },
      profile_picture: {
        type: String,
        required: false
      },
      about: {
        type: String,
        reuired: false
      }
    },
    {
      timestamps: true
    }
  )
  model: Model<any, any> = model<UserSchema>('users', this.schema)
}
