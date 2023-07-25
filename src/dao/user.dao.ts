import { MongoClient } from "mongodb";
import Log from "../util/logger";
import User from "../interfaces/user.interface";
import { autoInjectable, container, inject, injectable } from "tsyringe";
import BaseDao from "./base.dao";
import UserSchema from "../interfaces/user.interface";
import UserModel from "../model/user.model";

@injectable()
export default class UserDao extends BaseDao<UserSchema>{

    constructor(model?: UserModel){
        super(model)
    }

    public async findUserByUsername(username:String) : Promise<User> {
        return this.model.findOne(
            {
                username:username
            },{
                projection:{
                    _id:1,
                    username:1
                }
            }
        )
    }


}
