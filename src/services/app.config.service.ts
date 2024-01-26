import { autoInjectable, inject } from 'tsyringe'
import AppConfigDao from '../dao/app.config.dao'
import Log from '../util/logger'

@autoInjectable()
export default class AppConfigService {
  constructor(
    @inject(AppConfigDao)
    private appConfigDao: AppConfigDao
  ) {}

  public async getAppConfig(key: string) {
    Log.info('Getting AppConfigService:getAppConfig', { key })
    try {
      return await this.appConfigDao.findByKey(key)
    } catch (error) {
      Log.error(error.message, error.stack)
      throw error
    }
  }
}
