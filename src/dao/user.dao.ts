import { ObjectId } from 'mongoose'
import { injectable } from 'tsyringe'
import {
  default as User,
  default as UserSchema
} from '../interfaces/user.interface'
import UserModel from '../model/user.model'
import BaseDao from './base.dao'

@injectable()
export default class UserDao extends BaseDao<UserSchema> {
  constructor(model?: UserModel) {
    super(model)
  }

  public async findUserByUsername(username: String): Promise<User> {
    return this.model.findOne({
      username: username
    })
  }

  public async findById(id: ObjectId): Promise<User> {
    return this.model.findById(id)
  }

  public async updateProfile(
    username: string,
    displayName?: string,
    profileUrl?: string,
    about?: string
  ) {
    var update = {}
    if (displayName) update = { ...update, displayName: displayName }
    if (profileUrl) update = { ...update, profileUrl: profileUrl }
    if (about) update = { ...update, about: about }
    return this.model.updateOne(
      {
        username: username
      },
      update
    )
  }

  public async updateLastOnline(username: string) {
    return this.model.updateOne(
      {
        username: username
      },
      {
        lastOnline: new Date(),
        isOnline: false
      }
    )
  }

  public async setOnline(username: string) {
    return this.model.updateOne(
      {
        username: username
      },
      {
        isOnline: true
      }
    )
  }
}
