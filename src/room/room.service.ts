import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { existsSync, mkdir, unlink, writeFile } from 'fs';
import { Model } from 'mongoose';
import { extname, join } from 'path';
import { Room, RoomDocument } from 'src/room/schemas/room.schema';
import { v4 as uuid } from 'uuid';
import { UpdatePermsDto } from './dto/updatePerms.dto';
import { PermissionsManager } from "src/common/permissions-manager/permissions.manager";
import { Permissions } from "src/common/permissions-manager/mask/permissions";
import { Message, MessageDocument } from 'src/message/schemas/message.schema';
import { MuteRoomDto } from './dto/muteRoom.dto';
import { UserRooms, UserRoomsDocument } from 'src/user/schemas/userRooms.schema';
import { UserRoomsViewModel } from './viewModels/userRooms.viewModel';
import { PinRoomDto } from './dto/pimRoom.dto';

const _fileRootPath: string = './storage/room/avatars/'
const _filePath: string = '/room/avatars/';

@Injectable()
export class RoomService {
    constructor(@InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
        @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
        @InjectModel(UserRooms.name) private readonly userRoomsModel: Model<UserRoomsDocument>) { }

    async updateRoomAvatar(file: Express.Multer.File, roomId: string): Promise<string> {
        let room = await this.roomModel.findById(roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let _fileName: string = `${uuid()}${extname(file.originalname)}`
        
        if (!existsSync(_fileRootPath)){
            await mkdir(_fileRootPath, {recursive: true}, (err) => { console.log(err)});
        }

        writeFile(join(_fileRootPath, _fileName), file.buffer, (err) => {
            if (err) {
                return console.log(err);
            }
        });

        unlink(_fileRootPath + room.avatarUrl, (err) => {
            if (err) {
                console.log(err);
            }
        });

        room.avatarUrl = _fileName;
        room.save();

        return _filePath.concat(_fileName);
    }

    async givePerms(updatePermsDto: UpdatePermsDto) {
        let room = await this.roomModel.findById(updatePermsDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let origin = await this.userRoomsModel.findOne({ userId: updatePermsDto.origin, roomId: updatePermsDto.roomId });
        if (origin === null) throw new NotFoundException('Инициатор не состоит в чате');

        let target = await this.userRoomsModel.findOne({ userId: updatePermsDto.target, roomId: updatePermsDto.roomId });
        if (target === null) throw new NotFoundException('Пользователь не состоит в чате');

        let hasAccess: boolean = PermissionsManager.permissValidate(origin.role, Permissions.ACCESS_GIVE_ACCESS);
        if (!hasAccess) throw new ForbiddenException('У вас нет прав на изменение ролей пользователя');

        target.role = updatePermsDto.newRole;
        target.save();
    }

    async takePerms(updatePermsDto: UpdatePermsDto) {
        let room = await this.roomModel.findById(updatePermsDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');
        
        let origin = await this.userRoomsModel.findOne({ userId: updatePermsDto.origin, roomId: updatePermsDto.roomId });
        if (origin === null) throw new NotFoundException('Инициатор не состоит в чате');

        let target = await this.userRoomsModel.findOne({ userId: updatePermsDto.target, roomId: updatePermsDto.roomId });
        if (target === null) throw new NotFoundException('Пользователь не состоит в чате');

        let hasAccess: boolean = PermissionsManager.permissValidate(origin.role, Permissions.ACCESS_GIVE_ACCESS);
        if (!hasAccess) throw new ForbiddenException('У вас нет прав на изменение роли пользователя');

        let rankAllow: boolean = PermissionsManager.rankValidate(origin.role, target.role);
        if (!rankAllow) throw new ForbiddenException('У вас нет прав на изменение роли пользователя, выше или таким же рангом');

        target.role = updatePermsDto.newRole;
        target.save();
    }

    async getRoomDetails(roomId: string) {
        let room = await this.roomModel.findById(roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let message = await this.messageModel.findOne({ roomId: roomId }).sort({ _id: -1 });

        let lastMessage = null;
        if (message) {
            lastMessage = {
                text: message.text,
                userId: message.userId,
                date: message.date
            }
        }

        let members = await this.userRoomsModel.find({ roomId: roomId });

        return {
            id: room.id,
            title: room.name,
            avatarUrl: room.avatarUrl === undefined ? null : _filePath.concat(room.avatarUrl),
            membersCount: members.length,
            lastMessage: lastMessage
        }
    }

    async getRoomChat(roomId: string) {
        let room = await this.roomModel.findById(roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let messages = await this.messageModel.find( { roomId: roomId } );

        return {
            id: room.id,
            title: room.name,
            avatarUrl: room.avatarUrl === undefined ? null : _filePath.concat(room.avatarUrl),
            messages: messages
        }
    }
    
    async getUserRooms(userId: string, host: string): Promise<UserRoomsViewModel[]> {
        let userRooms = await this.userRoomsModel.find({ userId: userId });

        let rooms: any[] = [];

        for(const userRoom of userRooms){
            let room = await this.roomModel.findById(userRoom.roomId);
            let message = await this.messageModel.findOne({ roomId: userRoom.roomId }).sort({ _id: -1 });

            let lastMessage = null;
            if (message) {
                lastMessage = {
                    text: message.text,
                    userId: message.userId,
                    date: message.date
                }
            }

            let members = await this.userRoomsModel.find({ roomId: userRoom.roomId });

            let roomVM: UserRoomsViewModel = {
                roomId: userRoom.roomId,
                avatarUrl: room.avatarUrl === undefined ? null : host.concat(_filePath, room.avatarUrl),
                name: room.name,
                lastMessage: lastMessage,
                membersCount: members.length,
                isMuted: userRoom.isMuted,
                isPinned: userRoom.isPinned
            };

            if(room) rooms.push(roomVM)
        };

        return rooms;
    }
    
    async getRoomMembers(roomId: string) {
        let room = await this.roomModel.findById(roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let userRooms = await this.userRoomsModel.find({ roomId: roomId });
        if (userRooms.length == 0) throw new NotFoundException('В чате нет участников');

        let users: any[] = [];

        for (const userRoom of userRooms) {
            let userDto: any = {
                userId: userRoom.userId,
                role: userRoom.role
            };

            users.push(userDto);
        }

        return users;
    }

    async getRoomAttachs(roomId: string) {
        let room = await this.roomModel.findById(roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let messages = await this.messageModel.find({roomId: roomId, type: {$in:["document", "video", "image"]}});
        
        let attachments: any[] = [];

        for (const message of messages) {
            attachments.push({
                text: message.text,
                type: message.type,
                fileName: message.fileName,
                fileUrl: message.fileUrl,
                date: message.date,
                userId: message.userId
            });
        }
        return attachments;
    }

    async muteRoom(muteRoomDto: MuteRoomDto) {
        let room = await this.roomModel.findById(muteRoomDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let userRoom = await this.userRoomsModel.findOne({ userId: muteRoomDto.userId, roomId: muteRoomDto.roomId });
        if (userRoom === null) throw new NotFoundException('Пользователь не состоит в чате');

        userRoom.isMuted = true;
        userRoom.save();
    }

    async unmuteRoom(muteRoomDto: MuteRoomDto) {
        let room = await this.roomModel.findById(muteRoomDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let userRoom = await this.userRoomsModel.findOne({ userId: muteRoomDto.userId, roomId: muteRoomDto.roomId });
        if (userRoom === null) throw new NotFoundException('Пользователь не состоит в чате');
        
        userRoom.isMuted = false;
        userRoom.save();
    }

    async pinRoom(pinRoomDto: PinRoomDto) {
        let room = await this.roomModel.findById(pinRoomDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');        

        let userRoom = await this.userRoomsModel.findOne({ userId: pinRoomDto.userId, roomId: pinRoomDto.roomId });
        if (userRoom === null) throw new NotFoundException('Пользователь не состоит в чате');

        userRoom.isPinned = true;
        userRoom.save();
    }

    async unpinRoom(pinRoomDto: PinRoomDto) {
        let room = await this.roomModel.findById(pinRoomDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');        

        let userRoom = await this.userRoomsModel.findOne({ userId: pinRoomDto.userId, roomId: pinRoomDto.roomId });
        if (userRoom === null) throw new NotFoundException('Пользователь не состоит в чате');

        userRoom.isPinned = false;
        userRoom.save();
    }
}
