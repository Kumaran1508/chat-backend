import { Document } from 'mongoose'

export interface Auth {
  userId: string
  password: string
  salt: string
  refreshToken?: string
}

export interface UserSignup {
  mobileNumber: string
  username: string
  password: string
  displayName?: string
  profileUrl?: string
}

export interface UserLogin {
  username: string
  password: string
}

export interface AuthResponse {
  userId: string
  accessToken: string
}

export default interface AuthSchema extends Document, Auth {}
