import { Router } from 'express'
import AppConfigController from '../controllers/app.config.controller'

const appConfigRouter = Router()
const appConfigController = new AppConfigController()

appConfigRouter.get(
  '/min-android-app-version',
  appConfigController.getMinAndroidAppVersion.bind(appConfigController)
)

appConfigRouter.get(
  '/latest-android-app-version',
  appConfigController.getLatestAndroidAppVersion.bind(appConfigController)
)

export default appConfigRouter
