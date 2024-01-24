import { autoInjectable, container, inject, injectable } from 'tsyringe'
import Log from '../util/logger'
import { UIMessage } from '../constants/ui.message.constants'
import UserService from './user.service'
import AuthDao from '../dao/auth.dao'
import { randomBytes } from 'crypto'
import AuthModel from '../model/auth.model'
import AuthSchema, {
  Auth,
  AuthResponse,
  UserLogin,
  UserSignup
} from '../interfaces/auth.interface'
import mongoose from 'mongoose'
import { genSalt, hash } from 'bcrypt'
import { sign, verify } from 'jsonwebtoken'
import { Environment } from '../constants/environment.constants'
import { config } from 'dotenv'
import { User } from '../interfaces/user.interface'

@injectable()
export default class AuthService {
  passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/

  constructor(
    @inject(UserService)
    private userService: UserService,
    @inject(AuthDao)
    private authDao: AuthDao
  ) {}

  public async signup(user: UserSignup): Promise<boolean | Error> {
    Log.info('Entering AuthService:SignUp ' + user)
    const mobileRegex =
      /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/

    const session = await mongoose.startSession()
    try {
      if (!mobileRegex.test(user.mobile_number))
        return new Error(UIMessage.INVALID_MOBILE_NUMBER)
      if (!this.passwordRegex.test(user.password))
        return new Error(UIMessage.INVALID_PASSWORD)

      session.startTransaction()
      const usernameAvailability = await this.userService.findUserByUsername(
        user.username
      )
      if (usernameAvailability instanceof Error) throw usernameAvailability
      else if (usernameAvailability && usernameAvailability.username)
        return new Error(UIMessage.USERNAME_UNAVAILABLE)

      let userCreated = await this.userService.createUser(user)
      if (!(userCreated instanceof Error)) {
        const salt = await genSalt()
        const hashedPassword = await hash(user.password, salt)
        const userAuth = {
          userId: userCreated._id,
          password: hashedPassword,
          salt: salt
        }
        let authDocument
        if (userCreated)
          authDocument = await this.authDao.create(
            userAuth as unknown as AuthSchema
          )
        if (!authDocument) {
          session.abortTransaction()
          userCreated = new Error(UIMessage.ERROR_CREATING_USER)
          return userCreated
        }
        await session.commitTransaction()
        Log.info('Exiting AuthService:SignUp')
        return true
      }
      return userCreated
    } catch (error) {
      await session.abortTransaction()
      Log.error('Error at AuthService:SignUp :: ' + error.message)
      return error
    } finally {
      session.endSession()
    }
  }

  public async login(user: UserLogin): Promise<AuthResponse | Error> {
    if (
      !user ||
      !user.username ||
      !user.password ||
      user.username.length < 4 ||
      user.username.length > 20 ||
      !this.passwordRegex.test(user.password)
    )
      return new Error(UIMessage.INVALID_CREDENTIALS)

    try {
      const userLogin = await this.userService.findUserByUsername(user.username)
      if (userLogin instanceof Error) return new Error(UIMessage.INVALID_USER)

      const userAuth: AuthSchema = await this.authDao.findByUserId(
        userLogin._id
      )

      const hashedPassword = await hash(user.password, userAuth.salt)
      if (hashedPassword == userAuth.password) {
        const userInfo: User = {
          username: userLogin.username,
          mobile_number: userLogin.mobile_number,
          profile_url: userLogin.profile_url,
          display_name: userLogin.display_name,
          about: userLogin.about
        }

        config()
        const tokenSecret = process.env[Environment.TOKEN_SECRET]
        const token = sign(userInfo, tokenSecret)
        return {
          userId: userLogin.id,
          accessToken: token
        }
      }
      return new Error(UIMessage.INVALID_CREDENTIALS)
    } catch (error) {
      Log.error(error.message, error.stack)
      return error
    }
  }

  public async authenticate(token: string) {
    config()
    const tokenSecret = process.env[Environment.TOKEN_SECRET]
    try {
      const result = await verify(token, tokenSecret)
      Log.info('decoded user', result)
      return true
    } catch (e) {
      Log.error(e.message, e.stack)
      return false
    }
  }
}
