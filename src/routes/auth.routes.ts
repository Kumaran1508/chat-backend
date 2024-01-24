import { Router } from 'express'
import { AuthController } from '../controllers'
import { container } from 'tsyringe'

const authRouter = Router()
const authController = new AuthController()

authRouter.get('/', authController.getAuthBase.bind(authController))
authRouter.post('/login', authController.login.bind(authController))
authRouter.post('/signup', authController.signup.bind(authController))

export default authRouter
