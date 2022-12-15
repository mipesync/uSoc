import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateRoomDto } from "./dto/createRoom.dto";
import { JoinToRoomDto } from "./dto/joinToRoom.dto";
import { LeaveFromRoomDto } from "./dto/leaveFromRoom.dto";
import { UpdateRoomNameDto } from "./dto/updateRoomName.dto";
import { Room, RoomDocument } from "./schemas/room.schema";

@Injectable()
export class RoomGatewayService {
    constructor(@InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>) { }

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

        let itemIndex = room.usersId.indexOf(leaveFromRoom.userId, 0);
        room.usersId.splice(itemIndex, 1);
        room.save();
    }

    async getUserRooms(userId: string): Promise<RoomDocument[]> {
        let rooms = await this.roomModel.find({ usersId: userId });
        return rooms;
    }

    async updateRoomName(updateRoomNameDto: UpdateRoomNameDto) {
        let room = await this.roomModel.findById(updateRoomNameDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        room.name = updateRoomNameDto.name;
        room.save();
    }
}