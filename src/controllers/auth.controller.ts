import express, { Router, Request,Response } from 'express';
import DatabaseUtil from '../util/db.util';
import { autoInjectable, container, inject, injectable } from 'tsyringe';
import { AuthService } from '../services';
import { UserSignup } from '../interfaces/signup.interface';
import Log from '../util/logger';

@injectable()
export default class AuthController {
    router : Router;

    constructor(
        @inject(AuthService)
        private authService:AuthService
    ) {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/',this.getAuthBase)
        this.router.get('/login',this.login)
        this.router.get('/check-username',this.checkUsername)
        this.router.post('/signup',this.signup)
    }

    async signup(request : Request, response : Response) {
        const user : UserSignup = request.body;
    }

    async checkUsername(request : Request, response : Response) {
        const username = request.query.username as string;
        Log.info(`${username}`);
        const available = await this.authService.checkUsernameAvailability(username);
        if(username){
            if(available instanceof Boolean){
                return {
                    status : 200,
                    body : available
                }
            }
            else if(available instanceof Error){
                return {
                    status : 400,
                    body : available.message
                }
            }
        }
        else {
            return response.status(401).send({
                body:"Invalid inputs!"
            })
        }
            
                
    }
    
    login(request : Request, response : Response) {
        return response.status(200).send({message : "Auth/login response"})
    }

    async getAuthBase(request : Request, response : Response){
        DatabaseUtil.init();
        return response.status(200).send({message : "Auth base response"})
    }
}

container.register('AuthController',AuthController);