import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateRoomDto } from "./dto/createRoom.dto";
import { JoinToRoomDto } from "./dto/joinToRoom.dto";
import { LeaveFromRoomDto } from "./dto/leaveFromRoom.dto";
import { NewMessageDto } from "./dto/newMessage.dto";
import { Message, MessageDocument } from "./schemas/message.schema";
import { Room, RoomDocument } from "./schemas/room.schema";

@Injectable()
export class GatewayService {
    constructor(@InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
        @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>) {}

    async newMessage(newMessageDto: NewMessageDto) {
        let room = await this.roomModel.findById(newMessageDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        await this.messageModel.create(newMessageDto);
    }

    async createRoom(createRoomDto: CreateRoomDto): Promise<RoomDocument> {
        let room = await this.roomModel.create(createRoomDto);
        room.usersId.push(createRoomDto.userId);
        room.save();
        return room;
    }

    async joinToRoom(joinToRoomDto: JoinToRoomDto) {
        let room = await this.roomModel.findById(joinToRoomDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        room.usersId.push(joinToRoomDto.userId);
        room.save();
    }

    async leaveFromRoom(leaveFromRoom: LeaveFromRoomDto) {
        let room = await this.roomModel.findById(leaveFromRoom.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let itemIndex = room.usersId.indexOf(leaveFromRoom.userId);
        room.usersId.slice(itemIndex, itemIndex + 1);
        room.save();
    }

    async getUserRooms(userId: string): Promise<RoomDocument[]> {
        let rooms = await this.roomModel.find({ usersId: userId});
        return rooms;
    }
}