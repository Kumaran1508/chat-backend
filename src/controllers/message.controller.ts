import { WebSocketServer } from "ws";
import Log from "../util/logger";
import { Server } from "socket.io";
import { autoInjectable, inject, injectable } from "tsyringe";
import MessageService from "../services/message.service";
import { AuthService } from "../services";
import { Message, MessageRequest } from "../interfaces/message.interface";
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
        this.webSocketServer.on('connection', async socket => {
            Log.info('Socket Connnection established');

            /**
             *  TODO: Authenticate user. Disconnect if user is not authenticated.
             */

            socket.send("id : "+socket.id);
            
            socket.on('user',username => {
                Log.info('adding user',username);
                this.messageService.addUser(username,socket.id);
            });
            
            socket.on('message',data =>{
                Log.info('message received');
                const messageRequest = data as MessageRequest
                const receiver = this.messageService.getUser(messageRequest.receiver);
                if(receiver){
                    this.webSocketServer
                    .to(receiver)
                    .emit("message",{
                        from:messageRequest.sender,
                        message:messageRequest.message
                    });
                    socket.send(`Roger that! ${messageRequest.message} sent to user: ${receiver}`);
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

