import { WebSocketServer } from "ws";
import Log from "../util/logger";
import { Server } from "socket.io";
import { autoInjectable, inject, injectable } from "tsyringe";
import MessageService from "../services/message.service";
import { AuthService } from "../services";
import { Message, MessageRequest } from "../interfaces/message.interface";
import { JwtPayload, decode } from "jsonwebtoken";
import { UIMessage } from "../constants/ui.message.constants";
@autoInjectable()
export default class MessageController {
    public webSocketServer:Server;

    constructor(
            @inject(MessageService)
            private messageService?:MessageService,
            @inject(AuthService)
            private authService?:AuthService
        ) {
    }

    public init(){

        this.webSocketServer.use(async (socket,next) => {
            Log.info("Authenticating User");
            const token = socket.request.headers.authorization;
            if(token) {
                Log.info(token);
                try {
                    await this.authService.authenticate(token.split(" ")[1]);
                    next();
                } catch (error) {
                    Log.info(UIMessage.UNAUTHORIZED);
                    socket.disconnect(true);
                }
            }
            else {
                Log.info(UIMessage.UNAUTHORIZED);
                socket.disconnect(true);
            }
        })

        this.webSocketServer.on('connection', async socket => {
            Log.info('Socket Connnection established');


            socket.send("id : "+socket.id);
            
            socket.on('user',username => {
                Log.info('adding user',username);
                this.messageService.addUser(username,socket.id);
            });
            
            socket.on('message',data =>{
                Log.info('message received', data);
                const messageRequest = data as MessageRequest
                const receiver = this.messageService.getUser(messageRequest.receiver);

                const user = (decode(socket.request.headers.authorization.split(" ")[1]) as JwtPayload)['username'];
                if(user != messageRequest.sender) {
                    socket.send()
                    Log.error(UIMessage.UNAUTHORIZED);
                    return;
                }

                if(receiver){
                    this.webSocketServer
                    .to(receiver)
                    .emit("message",{
                        from:messageRequest.sender,
                        message:messageRequest.content
                    });
                    this.messageService.addMessage(messageRequest);
                    socket.send(`Roger that! ${messageRequest.content} sent to user: ${receiver}`);
                }
                else{
                    socket.send(`Not sent! User not found`);
                }
            });

            socket.on('close',()=>{
                this.messageService.deleteUser(socket.id);
                Log.info('connection closed');
            })

        });
    }


}

