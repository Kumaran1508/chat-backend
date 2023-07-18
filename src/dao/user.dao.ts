import { MongoClient } from "mongodb";
import DatabaseUtil from "../util/db.util";
import { UserSignup } from "../interfaces/signup.interface";
import Log from "../util/logger";
import User from "../interfaces/user.interface";
import { autoInjectable, container, injectable } from "tsyringe";

@injectable()
export default class UserDao {
    private database : MongoClient;
    private DB_NAME : string = "Pyng";
    private COLLECTION_NAME : string = "User";

    constructor(){
        this.init();
    }

    async init(){
        this.database = await DatabaseUtil.init();
    }

    public async createUser(user:UserSignup) : Promise<boolean> {
        Log.info('Entering UserDao:createUser');
        try{
            const result = await this.database
                .db(this.DB_NAME)
                .collection(this.COLLECTION_NAME)
                .insertOne(user);
            Log.debug(`${result.acknowledged}`);
            Log.info('Entering UserDao:createUser');
            return result.acknowledged;
        }
        catch(error){
            Log.error('Error at UserDao:createUser :: '+error.message);
            throw error;
        }
    }

    public async findUserByUsername(username:String) : Promise<User> {
        Log.info('Entering UserDao:createUser');
        try{
            const result = await this.database
                .db(this.DB_NAME)
                .collection(this.COLLECTION_NAME)
                .findOne(
                    {
                        username:username
                    },{
                        projection:{
                            _id:1,
                            username:1
                        }
                    }
                );

            Log.debug(`${result}`);
            Log.info('Entering UserDao:createUser')
            return result as unknown as User;
        }
        catch(error){
            Log.error('Error at UserDao:createUser :: '+error.message);
            throw error;
        }
    }


}

container.register('UserDao',UserDao);