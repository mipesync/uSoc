import { Logger, OnModuleInit } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import { ConnectToRoomsDto } from "./dto/connectToRooms.dto";
import { CreateRoomDto } from "./dto/createRoom.dto";
import { JoinToRoomDto } from "./dto/joinToRoom.dto";
import { LeaveFromRoomDto } from "./dto/leaveFromRoom.dto";
import { RoomGatewayService } from "./room.gateway.service";

@WebSocketGateway()
export class RoomGateway implements OnModuleInit {
    constructor(private readonly gatewayService: RoomGatewayService) {}

    @WebSocketServer()
    private server: Server;
    private logger: Logger = new Logger('RoomGateway');

    @SubscribeMessage('createRoom')
    async onCreateRoom(@MessageBody() roomDto: CreateRoomDto, @ConnectedSocket() socket: Socket) {
        let room = await this.gatewayService.createRoom(roomDto);
        
        socket.join(room.id);

        this.logger.log(`Чат "${roomDto.name}" был создан`);

        this.server.to(room.id).emit('onCreateRoom', {
            message: `Чат "${roomDto.name}" был создан`
        });
    }

    @SubscribeMessage('joinToRoom')
    async onJoinToRoom(@MessageBody() joinToRoomDto: JoinToRoomDto, @ConnectedSocket() socket: Socket) {
        socket.join(joinToRoomDto.roomId);
        this.logger.log(`${joinToRoomDto.userId} присоединился к чату`);
        this.server.to(joinToRoomDto.roomId).emit('onJoinToRoom', {
            message: `${joinToRoomDto.userId} присоединился к чату`
        });
        await this.gatewayService.joinToRoom(joinToRoomDto);
    }

    @SubscribeMessage('leaveFromRoom')
    async onLeaveFromRoom(@MessageBody() leaveFromRoomDto: LeaveFromRoomDto, @ConnectedSocket() socket: Socket) {
        socket.leave(leaveFromRoomDto.roomId);
        this.logger.log(`${leaveFromRoomDto.userId} покинул чат`);
        this.server.to(leaveFromRoomDto.roomId).emit('onLeaveFromRoom', {
            message: `${leaveFromRoomDto.userId} покинул чат`
        });
        await this.gatewayService.leaveFromRoom(leaveFromRoomDto);
    }

    @SubscribeMessage('connectToRooms')
    async onConnectToRooms(@MessageBody() connectToRoomsDto: ConnectToRoomsDto, @ConnectedSocket() socket: Socket) {
        let rooms = await this.gatewayService.getUserRooms(connectToRoomsDto.userId);
        rooms.forEach(room => {
            socket.join(room.id);
        });
    }
    
    onModuleInit() {
        this.server.on('connection', socket => {
            this.logger.log(`Клиент ${socket.id} был подключен`);
        });
    }
}