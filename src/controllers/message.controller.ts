import { WebSocketServer } from "ws";
import Log from "../util/logger";
import { Server } from "socket.io";

export default class MessageController {
    private webSocketServer : Server;

    constructor(webSocketServer:Server) {
        this.webSocketServer = webSocketServer
        this.init()
    }

    init(){
        Log.info('Setting up websocket listener');

        this.webSocketServer.on('connection', async socket => {
            Log.info('Socket Connnection established');

            
            
            socket.on('message',message =>{
                Log.info('message received');
                socket.send(`Roger that! ${message} from user: ${socket.id}`);
                this.webSocketServer.emit('broadcast',"broadcasting");
            });

            socket.on('close',()=>{
                Log.info('connection closed');
            })

            let count = 1;
            const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
            while(true){
                socket.send(`Test message ${count}`);
                count++;
                await sleep(5000);
            } 
        });

        
    }

}