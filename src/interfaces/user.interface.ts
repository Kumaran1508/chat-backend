import { Document } from 'mongoose'

export interface User {
  mobile_number: string
  username: string
  display_name?: string
  profile_url?: string
  about?: string
}

export interface UpdateProfile {
  about?: string
  profile_url?: string
  display_name?: string
  username: string
}

export default interface UserSchema extends Document, User {}

export interface UserResponse extends User {
  id: string
}
