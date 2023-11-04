import { Document } from "mongoose"

export interface Auth {
    userId:string,
    password:string,
    salt:string,
    refreshToken?:string
}

export interface UserSignup {
    mobile_number: string
    username: string
    password: string
    display_name?: string
    profile_url?:  string
}

export interface UserLogin {
    username: string
    password: string
}

export interface AuthResponse {
    userId: string,
    accessToken: string
}

export default interface AuthSchema extends Document,Auth {}