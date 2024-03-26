import { Document } from 'mongoose'

export interface User {
  mobileNumber: string
  username: string
  displayName?: string
  profileUrl?: string
  about?: string
  lastOnline?: Date
  isOnline?: boolean
}

export interface UpdateProfile {
  about?: string
  profileUrl?: string
  displayName?: string
  username: string
}

export default interface UserSchema extends Document, User {}

export interface UserResponse extends User {
  id: string
}
