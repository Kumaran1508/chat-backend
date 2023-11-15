import { injectable } from "tsyringe"
import BaseDao from "./base.dao"
import MessageModel from "../model/messge.model"
import { MessageSchema } from "../interfaces/message.interface"

@injectable()
export default class MessageDao extends BaseDao<MessageSchema>{

    constructor(model?: MessageModel){
        super(model)
    }
    
}