import { Logger, OnModuleInit } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { ConnectToRoomsDto } from "./dto/connectToRooms.dto";
import { CreateRoomDto } from "./dto/createRoom.dto";
import { DeleteUserDto } from "./dto/deleteUser.dto";
import { JoinToRoomDto } from "./dto/joinToRoom.dto";
import { LeaveFromRoomDto } from "./dto/leaveFromRoom.dto";
import { UpdateRoomAvatarDto } from "./dto/updateRoomAvatar.dto";
import { UpdateRoomNameDto } from "./dto/updateRoomName.dto";
import { RoomGatewayService } from "./room.gateway.service";

@WebSocketGateway()
export class RoomGateway implements OnModuleInit {
    constructor(private readonly gatewayService: RoomGatewayService) {}

    @WebSocketServer()
    private server: Server;
    private logger: Logger = new Logger('RoomGateway');

    @SubscribeMessage('createRoom')
    async onCreateRoom(@MessageBody() roomDto: CreateRoomDto, @ConnectedSocket() socket: Socket) {
        let roomId = await this.gatewayService.createRoom(roomDto);
        
        socket.join(roomId);
        this.server.to(roomId).emit('onCreateRoom', {
            roomId: roomId
        });
    }

    @SubscribeMessage('joinToRoom')
    async onJoinToRoom(@MessageBody() joinToRoomDto: JoinToRoomDto, @ConnectedSocket() socket: Socket) {
        await this.gatewayService.joinToRoom(joinToRoomDto).catch((e) => {
            this.server.to(socket.id).emit('onException', {
                statusCode: e.status,
                message: e.message
            });

            stop();
        });

        socket.join(joinToRoomDto.roomId);

        this.server.to(joinToRoomDto.roomId).emit('onJoinToRoom', {
            message: `${joinToRoomDto.userId} присоединился к чату`
        });
    }

    @SubscribeMessage('leaveFromRoom')
    async onLeaveFromRoom(@MessageBody() leaveFromRoomDto: LeaveFromRoomDto, @ConnectedSocket() socket: Socket) {
        await this.gatewayService.leaveFromRoom(leaveFromRoomDto).catch((e) => {
            this.server.to(socket.id).emit('onException', {
                statusCode: e.status,
                message: e.message
            });

            stop();
        });

        socket.leave(leaveFromRoomDto.roomId);

        this.server.to(leaveFromRoomDto.roomId).emit('onLeaveFromRoom', {
            message: `${leaveFromRoomDto.userId} покинул чат`
        });
    }

    @SubscribeMessage('connectToRooms')
    async onConnectToRooms(@MessageBody() connectToRoomsDto: ConnectToRoomsDto, @ConnectedSocket() socket: Socket) {
        let roomsId = await this.gatewayService.getUserRooms(connectToRoomsDto.userId);
        roomsId.forEach(roomId => {
            socket.join(roomId);
        });
    }
    
    @SubscribeMessage('updateRoomName')
    async onUpdateRoomName(@MessageBody() updateRoomNameDto: UpdateRoomNameDto) {        
        this.server.to(updateRoomNameDto.roomId).emit('onUpdateRoomName', {
            roomId: updateRoomNameDto.roomId,
            roomName: updateRoomNameDto,
            message: `Имя чата было изменено на ${updateRoomNameDto.name}`
        });

        await this.gatewayService.updateRoomName(updateRoomNameDto);
    }
    
    @SubscribeMessage('updateRoomAvatar')
    async onUpdateRoomAvatar(@MessageBody() updateRoomAvatar: UpdateRoomAvatarDto) {
        this.server.to(updateRoomAvatar.roomId).emit('onUpdateRoomAvatar', {
            message: `Аватар чата был изменён ${updateRoomAvatar.username}`,
            avatarUrl: updateRoomAvatar.avatarUrl
        });
    }

    @SubscribeMessage('deleteFromRoom')
    async onDeleteFromRoom(@MessageBody() deleteUserDto: DeleteUserDto, @ConnectedSocket() socket: Socket) {
        await this.gatewayService.deleteUser(deleteUserDto).catch((e) => {
            this.server.to(socket.id).emit('onException', {
                statusCode: e.status,
                message: e.message
            });

            stop();
        });

        this.server.sockets.sockets.forEach((socket) => {
            if(socket.id === deleteUserDto.targetConnectionId)
                socket.leave(deleteUserDto.roomId);
        });

        this.server.to(deleteUserDto.roomId).emit('onDeleteFromRoom', {
            message: `${deleteUserDto.origin} исключил ${deleteUserDto.target}`
        });
    }

    onModuleInit() {
        this.server.on('connection', socket => {
            this.server.to(socket.id).emit('onConnection', {connectionId: socket.id});
            this.logger.log(`Клиент ${socket.id} был подключен`);
        });
    }
}