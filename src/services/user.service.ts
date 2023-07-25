import { autoInjectable, container, inject, injectable } from "tsyringe";
import UserDao from "../dao/user.dao";
import Log from "../util/logger";
import { UIMessage } from "../constants/ui.message.constants";
import UserSchema from "../interfaces/user.interface";
import { Schema } from "mongoose";


@injectable()
export default class UserService{

    constructor(
        @inject(UserDao)
        private userDao:UserDao
    ){}

    public async createUser(user:any) : Promise<UserSchema | Error> {
        Log.info('Creating User UserService:createUser',user);
        try{
            return await this.userDao.create(user);
        }
        catch(error){
            Log.error('Error at UserService:createUser :: '+error.stack);
            throw error;
        }
    }

    public async deleteUser(user:any) : Promise<UserSchema | Error> {
        Log.info('Creating User UserService:deleteUser',user);
        try{
            return await this.userDao.delete(user);
        }
        catch(error){
            Log.error('Error at UserService:deleteUser :: '+error.stack);
            throw error;
        }
    }

    public async findUserByUsername(username:string) : Promise<UserSchema | Error> {
        Log.info('Searching UserService:findUserByUsername');
        try{
            if(username.length<4 || username.length>24) return new Error(UIMessage.INVALID_USERNAME);

            const user = await this.userDao.findUserByUsername(username);
        
            return user;
        }
        catch(error){
            Log.error('Error at UserService:findUserByUsername :: '+error.stack);
            return error;
        }
    }

}

