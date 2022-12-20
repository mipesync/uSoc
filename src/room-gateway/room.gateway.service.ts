import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateRoomDto } from "./dto/createRoom.dto";
import { JoinToRoomDto } from "./dto/joinToRoom.dto";
import { LeaveFromRoomDto } from "./dto/leaveFromRoom.dto";
import { UpdateRoomNameDto } from "./dto/updateRoomName.dto";
import { Room, RoomDocument } from "../room/schemas/room.schema";
import { Roles } from "src/permissions-manager/mask/roles";
import { DeleteUserDto } from "./dto/deleteUser.dto";
import { PermissionsManager } from "src/permissions-manager/permissions.manager";
import { Permissions } from "src/permissions-manager/mask/permissions";
import { UserRooms, UserRoomsDocument } from "src/user/schemas/userRooms.schema";

@Injectable()
export class RoomGatewayService {
    constructor(
        @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
        @InjectModel(UserRooms.name) private readonly userRoomsModel: Model<UserRoomsDocument>
    ) { }

    async createRoom(createRoomDto: CreateRoomDto): Promise<string> {
        let room = await this.roomModel.create({ name: createRoomDto.name });

        await this.userRoomsModel.create({
            roomId: room.id,
            role: Roles.CREATOR,
            userId: createRoomDto.userId
        });
        
        return room.id;
    }

    async joinToRoom(joinToRoomDto: JoinToRoomDto) {
        let room = await this.roomModel.findById(joinToRoomDto.roomId);
        if (!room) throw new NotFoundException('Комнаты не существует');

        let userRoom = await this.userRoomsModel.findOne({ userId: joinToRoomDto.userId, roomId: joinToRoomDto.roomId });
        if (userRoom) throw new BadRequestException('Пользователь уже состоит в чате');

        await this.userRoomsModel.create({
            roomId: joinToRoomDto.roomId,
            role: Roles.MEMBER,
            userId: joinToRoomDto.userId
        });
    }

    async leaveFromRoom(leaveFromRoom: LeaveFromRoomDto) {
        let room = await this.roomModel.findById(leaveFromRoom.roomId);
        if (!room) throw new NotFoundException('Комнаты не существует');

        await this.userRoomsModel.findOneAndRemove({ userId: leaveFromRoom.userId, roomId: leaveFromRoom.roomId });
    }

    async getUserRooms(userId: string): Promise<RoomDocument[]> {
        let roomsId = await this.userRoomsModel.find({ usersId: userId });

        let rooms: RoomDocument[];

        roomsId.forEach(async roomId => {
            let room = await this.roomModel.findOne({ id: roomId });
            if(room) rooms.push(room);            
        });

        return rooms;
    }

    async updateRoomName(updateRoomNameDto: UpdateRoomNameDto) {
        let room = await this.roomModel.findById(updateRoomNameDto.roomId);
        if (!room) throw new NotFoundException('Комнаты не существует');

        room.name = updateRoomNameDto.name;
        room.save();
    }

    async deleteUser(deleteUserDto: DeleteUserDto) {
        let room = await this.roomModel.findById(deleteUserDto.roomId);
        if (!room) throw new NotFoundException('Комнаты не существует');

        let origin = await this.userRoomsModel.findOne({userId: deleteUserDto.origin, roomId: deleteUserDto.roomId});
        if (!origin) throw new NotFoundException('Инициатор не состоит в чате');

        let target = await this.userRoomsModel.findOne({userId: deleteUserDto.target, roomId: deleteUserDto.roomId});
        if (!target) throw new NotFoundException('Пользователь не состоит в чате');

        let hasAccess: boolean = PermissionsManager.permissValidate(origin.role, Permissions.ACCESS_DELETE_USERS);
        if (!hasAccess) throw new ForbiddenException('У вас нет прав на удаление пользователя');

        let rankAllow: boolean = PermissionsManager.rankValidate(origin.role, target.role);
        if (!rankAllow) throw new ForbiddenException('У вас нет прав на удаление пользователя, выше или таким же рангом');

        
        await this.userRoomsModel.findOneAndRemove({ userId: deleteUserDto.target, roomId: deleteUserDto.roomId });
    }
}