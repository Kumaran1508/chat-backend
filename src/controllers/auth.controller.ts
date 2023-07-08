import express, { Router, Request,Response } from 'express';

export default class AuthController {
    router : Router;

    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }


    initializeRoutes() {
        this.router.get('/',this.getAuthBase)
        this.router.get('/login',this.login)
    }
    
    login(request : Request, response : Response) {
        return response.status(200).send({message : "Auth/login response"})
    }

    async getAuthBase(request : Request, response : Response){
        return response.status(200).send({message : "Auth base response"})
    }
}