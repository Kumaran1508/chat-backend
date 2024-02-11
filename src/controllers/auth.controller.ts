import { Request, Response } from 'express'
import { autoInjectable } from 'tsyringe'
import { UserLogin, UserSignup } from '../interfaces/auth.interface'
import { AuthService } from '../services'
import Log from '../util/logger'

@autoInjectable()
export default class AuthController {
  constructor(private authService?: AuthService) {}

  async signup(request: Request, response: Response) {
    try {
      const user: UserSignup = request.body
      if (!user || !user.mobileNumber || !user.username || !user.password) {
        response.status(400).send({ message: 'Invalid Credentials' })
        return
      }

      const result = await this.authService.signup(user)
      if (result instanceof Error) throw result
      response.status(200).send(result)
    } catch (error) {
      Log.error(error)
      response.status(500).send({ message: error.message })
    }
  }

  async login(request: Request, response: Response) {
    try {
      const user: UserLogin = request.body
      if (!user || !user.username || !user.password)
        response.status(400).send({ message: 'Invalid Credentials' })

      const result = await this.authService.login(user)
      if (result instanceof Error) throw result
      response.status(200).send(result)
    } catch (error) {
      Log.error(error.message, error.stack)
      response.status(500).send({ message: error.message })
    }
  }

  async getAuthBase(request: Request, response: Response) {
    return response.status(200).send({ message: 'Auth base response' })
  }
}
