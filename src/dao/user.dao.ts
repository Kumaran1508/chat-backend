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
            },
            {
                _id:1,
                username:1,
                mobile_number: 1
            }
        )
    }

    public async updateProfile(username: string, display_name?: string,profile_url?: string,about?: string) {
        var update = {}
        if(display_name) update = {...update,display_name:display_name}
        if(profile_url) update = {...update,profile_url:profile_url}
        if(about) update = {...update,about:about}
        return this.model.updateOne(
        {
            username: username
        },
        update)
    }

}
