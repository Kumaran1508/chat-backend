import "reflect-metadata";
import express, {Application,Request,Response} from 'express';
import {createServer} from 'http'
import { AuthController, MessageController } from './controllers';
import Log from './util/logger';
import { Server } from 'socket.io';
import { config } from 'dotenv';
import { container } from 'tsyringe';
import { AuthService } from "./services";
import UserDao from "./dao/user.dao";
import authRouter from "./routes/auth.routes";
import { InitDatabase } from "./util/database";
import userRouter from "./routes/user.routes";
import { json } from "body-parser";

const app : Application = express();
const port : Number = 3000;
const httpServer = createServer(app);
const socketServer = new Server(httpServer,{
    cors:{origin:"*"}
});
Log.createInstance();

config();

const messageController : MessageController = new MessageController(socketServer);

app.use(json());

app.get("/",
    async (req: Request, res: Response) => {
        Log.debug("/ request received");
        return res.status(200).send({
            message: "Hello World!",
        });
    }
);

app.use('/auth',authRouter);
app.use('/user',userRouter);

try {
    InitDatabase();
    httpServer.listen(port, (): void => {
        Log.debug(`Connected successfully on port ${port}`);
    });
} catch (error) {
    Log.debug(`Error occured: ${error.message}`);
}