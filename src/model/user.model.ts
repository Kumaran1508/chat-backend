import { Model, Schema, model } from 'mongoose'
import { singleton } from 'tsyringe'
import ModelI from '../interfaces/model.interface'
import UserSchema from '../interfaces/user.interface'

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
      profile_url: {
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
