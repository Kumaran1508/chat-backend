import  { Router, Request,Response } from 'express';
import { autoInjectable, container, inject, injectable } from 'tsyringe';
import { AuthService } from '../services';
import Log from '../util/logger';
import UserService from '../services/user.service';

@autoInjectable()
export default class UserController {

    constructor(
        private userService?:UserService
    ) {}

    async checkUsername(request : Request, response : Response) {
        const username = request.query.username as string;
        Log.info(`/check-username : ${username}`);
        const available = await this.userService.findUserByUsername(username);
        if(username){
            if(available instanceof Error){
                return response.status(500).send(available);
            }
            else return response.status(200).send(!available);
        }
        else {
            return response.status(401).send({
                body:"Invalid inputs!"
            })
        }               
    }
}
