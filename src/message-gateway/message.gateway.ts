import { ForbiddenException, Logger, OnModuleInit } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { DeleteMessageDto } from "./dto/deleteMessage.dto";
import { EditMessageDto } from "./dto/editMessage.dto";
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

    @SubscribeMessage('deleteMessage')
    async onDeleteMessage(@MessageBody() deleteMessageDto: DeleteMessageDto, @ConnectedSocket() socket: Socket) {
        await this.messageService.deleteMessage(deleteMessageDto).catch((e) => {
            this.server.to(socket.id).emit('onException', {
                statusCode: e.status,
                message: e.message
            });

            stop();
        });

        this.server.to(deleteMessageDto.roomId).emit('onDeleteMessage', {
            messageId: deleteMessageDto.messageId
        });
    }

    @SubscribeMessage('editMessage')
    async onEditMessage(@MessageBody() editMessageDto: EditMessageDto, @ConnectedSocket() socket: Socket) {
        await this.messageService.editMessage(editMessageDto).catch((e) => {
            this.server.to(socket.id).emit('onException', {
                statusCode: e.status,
                message: e.message
            });

            stop();
        });

        this.server.to(editMessageDto.roomId).emit('onEditMessage', {
            messageId: editMessageDto.messageId,
            text: editMessageDto.text
        });
    }

    onModuleInit() {
        this.server.on('connection', socket => {
            this.logger.log(`Клиент ${socket.id} был подключен`);
        });
    }
}