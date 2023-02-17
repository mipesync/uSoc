import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Permissions } from "src/common/permissions-manager/mask/permissions";
import { PermissionsManager } from "src/common/permissions-manager/permissions.manager";
import { Room, RoomDocument } from "src/room/schemas/room.schema";
import { UserRooms, UserRoomsDocument } from "src/user/schemas/userRooms.schema";
import { DeleteMessageDto } from "./dto/deleteMessage.dto";
import { EditMessageDto } from "./dto/editMessage.dto";
import { NewMessageDto } from "./dto/newMessage.dto";
import { PinMessageDto } from "./dto/pinMessage.dto";
import { Message, MessageDocument } from "../../message/schemas/message.schema";
import { unlink } from "fs";
import { CryptoManager } from "src/common/crypto-manager/crypto-manager";

//TODO: Доделать шифрование
@Injectable()
export class MessageGateWayService {
    constructor(@InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
        @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
        @InjectModel(UserRooms.name) private readonly userRoomsModel: Model<UserRoomsDocument>,
        private readonly cryptoManager: CryptoManager) {}

    async newMessage(newMessageDto: NewMessageDto) {
        let room = await this.roomModel.findById(newMessageDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');        

        if (newMessageDto.type !== 'text') {
            if (!newMessageDto.fileName) throw new BadRequestException('Поле "fileName" обязательно')
        }

        newMessageDto.date = Date.now().toString()

        let result = await this.messageModel.create(newMessageDto);
        
        if (typeof result === "string") {
            return result;
        } else {
            return result.id;
        }
    }

    async deleteMessage(deleteMessageDto: DeleteMessageDto) {
        let room = await this.roomModel.findById(deleteMessageDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let message = await this.messageModel.findById(deleteMessageDto.messageId);
        if (message === null) throw new NotFoundException('Сообщение не найдено');

        if (deleteMessageDto.userId !== message.userId) {
            let user = await this.userRoomsModel.findOne(user => user.userId === deleteMessageDto.userId);
            if (user === null) throw new NotFoundException('Пользователь не найден');

            let hasAccess: boolean = PermissionsManager.permissValidate(user.role, Permissions.ACCESS_DELETE_MESSAGES);
            if (!hasAccess) throw new ForbiddenException('У вас нет прав на удаление чужих сообщений');
        }

        if (message.type !== 'text') {            
            const _fileRootPath: string = `./storage/room/attachments/${deleteMessageDto.roomId}/`;

            unlink(_fileRootPath + message.fileName, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }

        message.delete();
    }

    async editMessage(editMessageDto: EditMessageDto) {
        let room = await this.roomModel.findById(editMessageDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let message = await this.messageModel.findById(editMessageDto.messageId);
        if (message === null) throw new NotFoundException('Сообщение не найдено');

        if (editMessageDto.userId !== message.userId) throw new ForbiddenException('У вас нет прав на редактирование чужих сообщений');

        message.text = editMessageDto.text;
        message.save();
    }

    async pinMessage(pinMessageDto: PinMessageDto) {
        let room = await this.roomModel.findById(pinMessageDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let message = await this.messageModel.findById(pinMessageDto.messageId);
        if (message === null) throw new NotFoundException('Сообщение не найдено');
        
        let index = room.pinned.findIndex(pin => pin.messageId === pinMessageDto.messageId);
        if (index === 0) throw new BadRequestException('Сообщение уже закреплено');

        room.pinned.push({
            messageId: pinMessageDto.messageId
        });
        room.save();
    }

    async unpinMessage(pinMessageDto: PinMessageDto) {
        let room = await this.roomModel.findById(pinMessageDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let message = await this.messageModel.findById(pinMessageDto.messageId);
        if (message === null) throw new NotFoundException('Сообщение не найдено');

        let index = room.pinned.findIndex(pin => pin.messageId === pinMessageDto.messageId);
        room.pinned.splice(index, 1);
        room.save();
    }
}
