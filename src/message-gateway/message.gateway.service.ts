import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Permissions } from "src/permissions-manager/mask/permissions";
import { PermissionsManager } from "src/permissions-manager/permissions.manager";
import { Room, RoomDocument } from "src/room/schemas/room.schema";
import { DeleteMessageDto } from "./dto/deleteMessage.dto";
import { NewMessageDto } from "./dto/newMessage.dto";
import { Message, MessageDocument } from "./schemas/message.schema";

@Injectable()
export class MessageGateWayService {
    constructor(@InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
                @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>) {}

    async newMessage(newMessageDto: NewMessageDto) {
        let room = await this.roomModel.findById(newMessageDto.roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        await this.messageModel.create(newMessageDto);
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
}