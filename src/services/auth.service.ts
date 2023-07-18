import { autoInjectable, container, inject, injectable } from "tsyringe";
import UserDao from "../dao/user.dao";
import { UserSignup } from "../interfaces/signup.interface";
import Log from "../util/logger";
import { UIMessage } from "../constants/ui.message.constants";

@injectable()
export default class AuthService{

    constructor(
        @inject(UserDao)
        private userDao:UserDao
    ){}

    public async signup(user:UserSignup) : Promise<boolean | Error> {
        Log.info('Entering AuthService:SignUp');
        try{
            const mobileRegex = /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
            if(!mobileRegex.test(user.mobile_number)) return new Error(UIMessage.INVALID_MOBILE_NUMBER);
            if(!passwordRegex.test(user.password)) return new Error(UIMessage.INVALID_PASSWORD);
            if(!this.checkUsernameAvailability(user.username)) new Error(UIMessage.USERNAME_UNAVAILABLE);

            Log.info('Exiting AuthService:SignUp');
            return await this.userDao.createUser(user);
        }
        catch(error){
            Log.error('Error at AuthService:SignUp :: '+error.message);
            throw error;
        }
    }

    public async checkUsernameAvailability(username:string) : Promise<boolean | Error> {
        Log.info('Entering AuthService:SignUp');
        try{
            if(username.length<4 || username.length>24) return new Error(UIMessage.INVALID_USERNAME);

            const user = await this.userDao.findUserByUsername(username);

            Log.info('Exiting AuthService:SignUp');
            return user==null;
        }
        catch(error){
            Log.error('Error at AuthService:SignUp :: '+error.message);
            throw error;
        }
    }

}

container.register('AuthService',AuthService);
