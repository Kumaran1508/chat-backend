import { Document } from "mongoose"

export interface User {
    mobile_number: string
    username: string
    display_name?: string
    profile_url?:  string
    about?: string
}
export default interface UserSchema extends Document,User {}