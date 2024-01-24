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
    display_name?: string,
    profile_url?: string,
    about?: string
  ) {
    var update = {}
    if (display_name) update = { ...update, display_name: display_name }
    if (profile_url) update = { ...update, profile_url: profile_url }
    if (about) update = { ...update, about: about }
    return this.model.updateOne(
      {
        username: username
      },
      update
    )
  }
}
