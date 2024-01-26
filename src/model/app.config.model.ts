import { Model, Schema, model } from 'mongoose'
import { singleton } from 'tsyringe'
import AppConfigSchema from '../interfaces/app.config.interface'
import ModelI from '../interfaces/model.interface'

@singleton()
export default class AppConfigModel implements ModelI {
  schema: Schema<any> = new Schema(
    {
      key: {
        type: String,
        required: true,
        unique: true
      },
      value: {
        type: String,
        required: true
      }
    },
    {
      timestamps: true
    }
  )
  model: Model<any, any> = model<AppConfigSchema>('app-config', this.schema)
}
