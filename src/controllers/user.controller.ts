import { Request, Response } from 'express'
import { UpdateResult } from 'mongodb'
import { autoInjectable } from 'tsyringe'
import { UIMessage } from '../constants/ui.message.constants'
import { UpdateProfile, UserResponse } from '../interfaces/user.interface'
import UserService from '../services/user.service'
import Log from '../util/logger'

@autoInjectable()
export default class UserController {
  constructor(private userService?: UserService) {}

  async checkUsername(request: Request, response: Response) {
    const username = request.query.username as string
    Log.info(`/check-username : ${username}`)
    if (username) {
      const available = await this.userService.findUserByUsername(username)
      if (available instanceof Error) {
        return response.status(500).send(available)
      } else return response.status(200).send(!available)
    } else {
      return response.status(400).send({
        body: 'Invalid Username!'
      })
    }
  }

  async updateProfile(request: Request, response: Response) {
    try {
      const profile: UpdateProfile = request.body
      if (
        !profile ||
        (profile.display_name && profile.display_name.length > 20)
      ) {
        response.status(400).send({ message: 'Invalid Profile' })
        return
      }

      const result: UpdateResult = await this.userService.updateProfile(profile)
      if (result instanceof Error) throw result
      response.status(200).send(result.acknowledged)
    } catch (error) {
      Log.error('UpdateProfileError', error.message)
      response.status(500).send({ message: error.message })
    }
  }

  async getUser(request: Request, response: Response) {
    try {
      const id = request.query.id
      const username = request.query.username
      Log.info(`find User : ${username}`)
      if (username || id) {
        const user = id
          ? await this.userService.findUserById(id as string)
          : await this.userService.findUserByUsername(username as string)
        if (user instanceof Error) response.status(500).send(user)
        else {
          const userResponse: UserResponse = {
            id: user.id,
            mobile_number: user.mobile_number,
            username: user.username,
            display_name: user.display_name,
            about: user.about,
            profile_url: user.profile_url
          }
          response.status(200).send(userResponse)
        }
      } else {
        response.status(400).send(UIMessage.INVALID_USERNAME_OR_ID)
      }
    } catch (error) {
      Log.error('errorFindingUser', error)
      response.status(500).send('Internal error occured')
    }
  }
}
