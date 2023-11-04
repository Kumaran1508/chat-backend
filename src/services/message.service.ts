import { inject, injectable } from "tsyringe";
import UserService from "./user.service";
import MessageDao from "../dao/message.dao";
import Log from "../util/logger";
import { Server } from "socket.io";

@injectable()
export default class MessageService{
    private userList : Map<string,string> = new Map();

    constructor(
        @inject(UserService)
        private userService?:UserService,
        @inject(MessageDao)
        private authDao?:MessageDao
    ){}

    addUser(username:string,socketId:string){
        this.userList.set(username,socketId);
    }

    getUser(username:string){
        return this.userList.get(username);
    }
    
    deleteUser(username:string) {
        for (let [key, value] of this.userList.entries()) {
            if (value === username)
                this.userList.delete(key);
        }
        
    }

}

