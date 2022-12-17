import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateRoomDto } from "./dto/createRoom.dto";
import { JoinToRoomDto } from "./dto/joinToRoom.dto";
import { LeaveFromRoomDto } from "./dto/leaveFromRoom.dto";
import { UpdateRoomNameDto } from "./dto/updateRoomName.dto";
import { Room, RoomDocument } from "../room/schemas/room.schema";
import { Roles } from "src/permissions-manager/mask/roles";
import { DeleteUserDto } from "./dto/deleteUser.dto";
import { User, UserDocument } from "src/auth/schemas/user.schema";
import { PermissionsManager } from "src/permissions-manager/permissions.manager";
import { Permissions } from "src/permissions-manager/mask/permissions";

@Injectable()
export class RoomGatewayService {
    constructor(
        @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) { }

    async createRoom(createRoomDto: CreateRoomDto): Promise<RoomDocument> {
        let room = await this.roomModel.create(createRoomDto);
        room.users.push({ userId: createRoomDto.userId, role: Roles.CREATOR });
        room.save();
        return room;
    }

    async joinToRoom(joinToRoomDto: JoinToRoomDto) {
        let room = await this.roomModel.findById(joinToRoomDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let user = room.users.find(user => user.userId === joinToRoomDto.userId);
        if (user) return;

        room.users.push({ userId: joinToRoomDto.userId, role: Roles.MEMBER });
        room.save();
    }

    async leaveFromRoom(leaveFromRoom: LeaveFromRoomDto) {
        let room = await this.roomModel.findById(leaveFromRoom.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let itemIndex = room.users.findIndex(user => user.userId === leaveFromRoom.userId);
        room.users.splice(itemIndex, 1);
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

    async deleteUser(deleteUserDto: DeleteUserDto) {
        let room = await this.roomModel.findById(deleteUserDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let origin = room.users.find(user => user.userId === deleteUserDto.origin);
        if (origin === null) throw new NotFoundException('Инициатор не найден');

        let target = room.users.find(user => user.userId === deleteUserDto.target);
        if (target === null) throw new NotFoundException('Пользователь не найден');

        let hasAccess: boolean = PermissionsManager.permissValidate(origin.role, Permissions.ACCESS_DELETE_USERS);
        if (!hasAccess) throw new ForbiddenException('У вас нет прав на удаление пользователя');

        let rankAllow: boolean = PermissionsManager.rankValidate(origin.role, target.role);
        if (!rankAllow) throw new ForbiddenException('У вас нет прав на удаление пользователя, выше или таким же рангом');

        
        let itemIndex = room.users.findIndex(user => user.userId === target.userId);
        room.users.splice(itemIndex, 1);
        room.save();
    }
}