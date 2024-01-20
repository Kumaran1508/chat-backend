import  { Router, Request,Response } from 'express';
import { autoInjectable, container, inject, injectable } from 'tsyringe';
import { AuthService } from '../services';
import Log from '../util/logger';
import UserService from '../services/user.service';
import { UpdateProfile } from '../interfaces/user.interface';
import { UpdateResult } from 'mongodb';

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

    async updateProfile(request: Request, response: Response) {
        try{
            const profile : UpdateProfile = request.body;
            if(!profile ||
                (profile.display_name && profile.display_name.length>20)) {
                    response.status(400).send({message: "Invalid Profile"});
                    return;
            }

            const result : UpdateResult = await this.userService.updateProfile(profile);
            if(result instanceof Error) throw result;
                response.status(200).send(result.acknowledged);
        } catch(error) {
            Log.error("UpdateProfileError",error.message);
            response.status(500).send({message: error.message})
        }
    }
}
