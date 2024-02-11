import { Schema } from 'mongoose'
import { inject, injectable } from 'tsyringe'
import { UIMessage } from '../constants/ui.message.constants'
import UserDao from '../dao/user.dao'
import UserSchema, { UpdateProfile } from '../interfaces/user.interface'
import Log from '../util/logger'

@injectable()
export default class UserService {
  constructor(
    @inject(UserDao)
    private userDao: UserDao
  ) {}

  public async createUser(user: any): Promise<UserSchema | Error> {
    Log.info('Creating User UserService:createUser', user)
    try {
      return await this.userDao.create(user)
    } catch (error) {
      Log.error('Error at UserService:createUser :: ' + error.stack)
      throw error
    }
  }

  public async deleteUser(user: any): Promise<UserSchema | Error> {
    Log.info('Creating User UserService:deleteUser', user)
    try {
      return await this.userDao.delete(user)
    } catch (error) {
      Log.error('Error at UserService:deleteUser :: ' + error.stack)
      throw error
    }
  }

  public async findUserByUsername(
    username: string
  ): Promise<UserSchema | Error> {
    Log.info('Searching UserService:findUserByUsername')
    try {
      if (username.length < 4 || username.length > 24)
        return new Error(UIMessage.INVALID_USERNAME)
      const user = await this.userDao.findUserByUsername(username)
      return user
    } catch (error) {
      Log.error('Error at UserService:findUserByUsername :: ' + error.stack)
      return error
    }
  }

  public async findUserById(userId: string) {
    Log.info('Searching UserService:findUserByUsername')
    try {
      const id = new Schema.Types.ObjectId(userId)
      const user = await this.userDao.findById(id)
      return user
    } catch (error) {
      Log.error('Error at UserService:findUserByUsername :: ' + error.stack)
      return new Error('user not found')
    }
  }

  public async updateProfile(profile: UpdateProfile) {
    Log.info('Searching UserService:updateProfile')
    try {
      if (profile.username.length < 4 || profile.username.length > 24)
        return new Error(UIMessage.INVALID_USERNAME)
      if (profile.displayName && profile.displayName.length > 24)
        return new Error(UIMessage.INVALID_DISPLAY_NAME)

      const updated = await this.userDao.updateProfile(
        profile.username,
        profile.displayName,
        profile.profileUrl,
        profile.about
      )
      Log.info('update complete: ', updated)
      return updated
    } catch (error) {
      Log.error('Error at UserService:updateProfile :: ' + error.stack)
      return error
    }
  }
}
