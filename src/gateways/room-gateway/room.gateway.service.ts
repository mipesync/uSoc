import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateRoomDto } from "./dto/createRoom.dto";
import { JoinToRoomDto } from "./dto/joinToRoom.dto";
import { LeaveFromRoomDto } from "./dto/leaveFromRoom.dto";
import { UpdateRoomNameDto } from "./dto/updateRoomName.dto";
import { DeleteUserDto } from "./dto/deleteUser.dto";
import { UserRooms, UserRoomsDocument } from "src/user/schemas/userRooms.schema";
import { Room, RoomDocument } from "src/room/schemas/room.schema";
import { Roles } from "src/common/permissions-manager/mask/roles";
import { PermissionsManager } from "src/common/permissions-manager/permissions.manager";
import { Permissions } from "src/common/permissions-manager/mask/permissions";
import { DeleteAvatarDto } from "./dto/deleteAvatar.dto";
import { unlink } from "fs";

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

    async getUserRooms(userId: string): Promise<string[]> {
        let userRooms = await this.userRoomsModel.find({ userId: userId });

        let rooms: string[] = [];

        for(const userRoom of userRooms){
            let room = await this.roomModel.findById(userRoom.roomId);
            if(room) rooms.push(room.id);            
        };
        
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

    async deleteAvatar(deleteAvatarDto: DeleteAvatarDto) {        
        let room = await this.roomModel.findById(deleteAvatarDto.roomId);
        if (!room) throw new NotFoundException('Комнаты не существует');

        const _fileRootPath = `./storage/room/avatar/`;
        unlink(_fileRootPath + room.avatarUrl, (err) => {
            if (err){
                console.log(err);
            }
        });

        room.avatarUrl = undefined;
        room.save();
    }
}