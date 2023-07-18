import { ConnectOptions, DbOptions, MongoClient, MongoClientOptions } from "mongodb";
import { Environment } from "../constants/environment.constants";
import Log from "./logger";

export default class DatabaseUtil {
    

    static async init() : Promise<MongoClient>{
        const db_url = process.env[Environment.DB_CONNECTION_STRING];
        const connectionOptions: MongoClientOptions = {
            maxPoolSize:50
        }

        try{
            Log.info(`url : ${db_url}`);
            let client = new MongoClient(db_url,connectionOptions);

            client = await client.connect();
            return client;
        }
        catch(error){
            Log.error("Error Connecting to Database : "+ error.message);
            Log.info("Stopping Application");
            throw new Error(error);
        }
    }




}