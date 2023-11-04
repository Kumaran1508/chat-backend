import { Model, Schema, model } from "mongoose"
import { singleton } from "tsyringe"
import ModelI from "../interfaces/model.interface"
import { MessageSchema } from "../interfaces/message.interface"

@singleton()
export default class MessageModel implements ModelI {
    schema: Schema<any> = new Schema({
        userId : {
            type:String,
            required:true
        },
        password : {
            type:String,
            required:true,
        },
        salt: {
            type:String,
            required:true
        },
        refreshToken:{
            type:String,
            required:false,
        },
    },{
        timestamps:true
    })
    model: Model<any,any> = model<MessageSchema>("message",this.schema)
}