import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { unlink, writeFile } from 'fs';
import { Model } from 'mongoose';
import { extname, join } from 'path';
import { Room, RoomDocument } from 'src/room/schemas/room.schema';
import { v4 as uuid } from 'uuid';
import { UpdatePermsDto } from './dto/updatePerms.dto';
import { PermissionsManager } from "src/permissions-manager/permissions.manager";
import { Permissions } from "src/permissions-manager/mask/permissions";
import { Message, MessageDocument } from 'src/message-gateway/schemas/message.schema';

const _fileRootPath: string = './storage/room/avatars/'

@Injectable()
export class RoomService {
    constructor(@InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
                @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>) { }

    async updateRoomAvatar(file: Express.Multer.File, roomId: string): Promise<string> {
        let room = await this.roomModel.findById(roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let _fileName: string = `${uuid()}${extname(file.originalname)}`

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

        return '/room/avatars/'.concat(_fileName);
    }

    async givePerms(updatePermsDto: UpdatePermsDto) {
        let room = await this.roomModel.findById(updatePermsDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let origin = room.users.find(user => user.userId === updatePermsDto.origin);
        if (origin === null) throw new NotFoundException('Инициатор не найден');

        let target = room.users.find(user => user.userId === updatePermsDto.target);
        if (target === null) throw new NotFoundException('Пользователь не найден');

        let hasAccess: boolean = PermissionsManager.permissValidate(origin.role, Permissions.ACCESS_GIVE_ACCESS);
        if (!hasAccess) throw new ForbiddenException('У вас нет прав на изменение ролей пользователя');

        target.role = updatePermsDto.newRole;
        room.users[room.users.findIndex(user => user.userId === updatePermsDto.target)] = target;
        room.save();
    }

    async takePerms(updatePermsDto: UpdatePermsDto) {
        let room = await this.roomModel.findById(updatePermsDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let origin = room.users.find(user => user.userId === updatePermsDto.origin);
        if (origin === null) throw new NotFoundException('Инициатор не найден');

        let target = room.users.find(user => user.userId === updatePermsDto.target);
        if (target === null) throw new NotFoundException('Пользователь не найден');

        let hasAccess: boolean = PermissionsManager.permissValidate(origin.role, Permissions.ACCESS_GIVE_ACCESS);
        if (!hasAccess) throw new ForbiddenException('У вас нет прав на изменение роли пользователя');

        let rankAllow: boolean = PermissionsManager.rankValidate(origin.role, target.role);
        if (!rankAllow) throw new ForbiddenException('У вас нет прав на изменение роли пользователя, выше или таким же рангом');

        target.role = updatePermsDto.newRole;
        room.users[room.users.findIndex(user => user.userId === updatePermsDto.target)] = target;
        room.save();
    }

    //TODO: Надо будет сделать маппинг ссылок вложений
    async getRoomDetails(roomId: string) {
        let room = await this.roomModel.findById(roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let messages = await this.messageModel.find( { roomId: roomId, type: ['video', 'image', 'document', 'audio'] } );

        return {
            id: room.id,
            title: room.name,
            avatarUrl: '/room/avatars/'.concat(room.avatarUrl),
            attachments: messages,
            members: room.users,
            membersCount: room.users.length,
        }
    }

    //TODO: Надо будет сделать маппинг ссылок вложений
    async getRoomChat(roomId: string) {
        let room = await this.roomModel.findById(roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let messages = await this.messageModel.find( { roomId: roomId } );

        return {
            id: room.id,
            title: room.name,
            avatarUrl: '/room/avatars/'.concat(room.avatarUrl),
            messages: messages
        }
    }
}
