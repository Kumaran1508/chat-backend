import User from '../interfaces/user.interface'
import { autoInjectable, container, inject, injectable } from 'tsyringe'
import BaseDao from './base.dao'
import AuthSchema from '../interfaces/auth.interface'
import AuthModel from '../model/auth.model'

@injectable()
export default class AuthDao extends BaseDao<AuthSchema> {
  constructor(model?: AuthModel) {
    super(model)
  }

  async findByUserId(userId: String) {
    return await this.model.findOne({
      userId: userId
    })
  }
}
