import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Room, RoomDocument } from "src/room-gateway/schemas/room.schema";
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
}