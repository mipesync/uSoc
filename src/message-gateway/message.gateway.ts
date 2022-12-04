import { ForbiddenException, Logger, OnModuleInit } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { NewMessageDto } from "./dto/newMessage.dto";
import { MessageGateWayService } from "./message.gateway.service";

@WebSocketGateway()
export class MessageGateway implements OnModuleInit {
    constructor(private readonly messageService: MessageGateWayService) {}

    @WebSocketServer()
    private readonly server: Server;
    private readonly logger: Logger = new Logger('MessageGateway');
    
    @SubscribeMessage('newMessage')
    async onSendMessage(@MessageBody() messageDto: NewMessageDto, @ConnectedSocket() socket: Socket) {
        if (!socket.rooms.has(messageDto.roomId)) {
            throw new ForbiddenException('Пользователь не состоит в чате');
        }
        this.server.to(messageDto.roomId).emit('onSendMessage', messageDto);
        await this.messageService.newMessage(messageDto);
    }

    onModuleInit() {
        this.server.on('connection', socket => {
            this.logger.log(`Клиент ${socket.id} был подключен`);
        });
    }
}