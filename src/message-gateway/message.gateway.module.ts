import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Room, RoomSchema } from "src/room/schemas/room.schema";
import { MessageGateway } from "./message.gateway";
import { MessageGateWayService } from "./message.gateway.service";
import { Message, MessageSchema } from "./schemas/message.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Message.name, schema: MessageSchema },
            { name: Room.name, schema: RoomSchema }])
        ],
    providers: [ MessageGateWayService, MessageGateway ]
})
export class MessageGatewayModule {}