import { Request, Response } from 'express'
import { autoInjectable } from 'tsyringe'
import { AppConfigKeys } from '../constants/app.config.constatns'
import AppConfigService from '../services/app.config.service'
import Log from '../util/logger'

@autoInjectable()
export default class AppConfigController {
    getlatestAndroidAppVersion: any
    constructor(private appConfigService?: AppConfigService) { }

    async getMinAndroidAppVersion(request: Request, response: Response) {
        try {
            const minAppVersion = await this.appConfigService.getAppConfig(
                AppConfigKeys.ANDROID_MIN_VERSION_KEY
            )
            if (minAppVersion) response.status(200).send(minAppVersion.value)
            else response.status(404).send({ message: "Not found" })
        } catch (e) {
            Log.error(e.message, e)
            response.status(500).json({ message: e.message })
        }
    }

    async getLatestAndroidAppVersion(request: Request, response: Response) {
        try {
            const latestAppVersion = await this.appConfigService.getAppConfig(
                AppConfigKeys.ANDROID_LATEST_VERSION_KEY
            )
            if (latestAppVersion) response.status(200).send(latestAppVersion.value)
            else response.status(404).send({ message: "Not found" })
        } catch (e) {
            Log.error(e.message, e)
            response.status(500).json({ message: e.message })
        }
    }
}
