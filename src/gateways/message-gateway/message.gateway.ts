import { Logger, OnModuleInit, Req, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Request } from "express";
import { Socket, Server } from "socket.io";
import { WsGuard } from "src/auth/jwt/ws.guard";
import { DeleteMessageDto } from "./dto/deleteMessage.dto";
import { EditMessageDto } from "./dto/editMessage.dto";
import { NewMessageDto } from "./dto/newMessage.dto";
import { PinMessageDto } from "./dto/pinMessage.dto";
import { MessageGateWayService } from "./message.gateway.service";

@UseGuards(WsGuard)
@WebSocketGateway()
export class MessageGateway implements OnModuleInit {
    constructor(private readonly messageService: MessageGateWayService) {}

    @WebSocketServer()
    private readonly server: Server;
    private readonly logger: Logger = new Logger('MessageGateway');
    
    @SubscribeMessage('newMessage')
    async onSendMessage(@MessageBody() messageDto: NewMessageDto, @ConnectedSocket() socket: Socket, @Req() req: Request) {
        if (!socket.rooms.has(messageDto.roomId)) {
            this.server.to(socket.id).emit('onException', {
                statusCode: 403,
                message: 'Пользователь не состоит в чате'
            });
        }
        
        let messageId = await this.messageService.newMessage(messageDto).catch((e) => {
            this.server.to(socket.id).emit('onException', {
                statusCode: e.status,
                message: e.message
            });

            stop();
        });

        this.server.to(messageDto.roomId).emit('onSendMessage', {
            id: messageId,
            message: messageDto
        });
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

    @SubscribeMessage('pinMessage')
    async onPinMessage(@MessageBody() pinMessageDto: PinMessageDto, @ConnectedSocket() socket: Socket) {
        await this.messageService.pinMessage(pinMessageDto).catch((e) => {
            this.server.to(socket.id).emit('onException', {
                statusCode: e.status,
                message: e.message
            });

            stop();
        });

        this.server.to(pinMessageDto.roomId).emit('onPinMessage', {
            messageId: pinMessageDto.messageId,
            userId: pinMessageDto.userId
        });
    }

    @SubscribeMessage('unpinMessage')
    async onUnpinMessage(@MessageBody() pinMessageDto: PinMessageDto, @ConnectedSocket() socket: Socket) {
        await this.messageService.unpinMessage(pinMessageDto).catch((e) => {
            this.server.to(socket.id).emit('onException', {
                statusCode: e.status,
                message: e.message
            });

            stop();
        });

        this.server.to(pinMessageDto.roomId).emit('onUnpinMessage', {
            messageId: pinMessageDto.messageId,
            userId: pinMessageDto.userId
        });
    }

    onModuleInit() {
        this.server.on('connection', socket => {
            this.logger.log(`Клиент ${socket.id} был подключен`);
        });
    }
}