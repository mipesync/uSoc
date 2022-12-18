import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Permissions } from "src/permissions-manager/mask/permissions";
import { PermissionsManager } from "src/permissions-manager/permissions.manager";
import { Room, RoomDocument } from "src/room/schemas/room.schema";
import { DeleteMessageDto } from "./dto/deleteMessage.dto";
import { EditMessageDto } from "./dto/editMessage.dto";
import { NewMessageDto } from "./dto/newMessage.dto";
import { PinMessageDto } from "./dto/pinMessage.dto";
import { Message, MessageDocument } from "./schemas/message.schema";

@Injectable()
export class MessageGateWayService {
    constructor(@InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
                @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>) {}

    async newMessage(newMessageDto: NewMessageDto) {
        let room = await this.roomModel.findById(newMessageDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let result = await this.messageModel.create(newMessageDto);
        return result.id;
    }

    async deleteMessage(deleteMessageDto: DeleteMessageDto) {
        let room = await this.roomModel.findById(deleteMessageDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let message = await this.messageModel.findById(deleteMessageDto.messageId);
        if (message === null) throw new NotFoundException('Сообщение не найдено');

        if (deleteMessageDto.userId !== message.userId) {
            let user = room.users.find(user => user.userId === deleteMessageDto.userId);
            if (user === null) throw new NotFoundException('Пользователь не найден');

            let hasAccess: boolean = PermissionsManager.permissValidate(user.role, Permissions.ACCESS_DELETE_MESSAGES);
            if (!hasAccess) throw new ForbiddenException('У вас нет прав на удаление чужих сообщений');
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

        room.pinned.push({
            userId: pinMessageDto.userId,
            messageId: pinMessageDto.messageId
        });
        room.save();
    }
}