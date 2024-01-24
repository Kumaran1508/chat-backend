import { Model, Schema, model } from 'mongoose'
import { singleton } from 'tsyringe'
import AuthSchema from '../interfaces/auth.interface'
import ModelI from '../interfaces/model.interface'

@singleton()
export default class AuthModel implements ModelI {
  schema: Schema<any> = new Schema(
    {
      userId: {
        type: String,
        required: true
      },
      password: {
        type: String,
        required: true
      },
      salt: {
        type: String,
        required: true
      },
      refreshToken: {
        type: String,
        required: false
      }
    },
    {
      timestamps: true
    }
  )
  model: Model<any, any> = model<AuthSchema>('auth', this.schema)
}
