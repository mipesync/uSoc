import { Logger, OnModuleInit } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io'
import { NewMessage } from "./dto/newMessage.dto";

@WebSocketGateway()
export class AddGateway implements OnModuleInit {
    @WebSocketServer()
    private server: Server;
    private logger: Logger = new Logger('AppGateway');
    
    onModuleInit() {
        this.server.on('connection', socket => {
            this.logger.log(`Client ${socket.id} has been connected`);
        });
    }
}