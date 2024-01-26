import { injectable } from 'tsyringe'
import AppConfigSchema from '../interfaces/app.config.interface'
import AppConfigModel from '../model/app.config.model'
import BaseDao from './base.dao'

@injectable()
export default class AppConfigDao extends BaseDao<AppConfigSchema> {
  constructor(model?: AppConfigModel) {
    super(model)
  }

  async findByKey(key: string) {
    return await this.model.findOne({
      key: key
    })
  }
}
