import { Router } from 'express'
import UserController from '../controllers/user.controller'

const userRouter = Router()
const userController = new UserController()

userRouter.get(
  '/check-username',
  userController.checkUsername.bind(userController)
)

userRouter.post(
  '/update-profile',
  userController.updateProfile.bind(userController)
)

// userRouter.get("/something",controller.method.bind(controller))

export default userRouter
