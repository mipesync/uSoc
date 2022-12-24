import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/user/schemas/user.schema";
import { Room, RoomSchema } from "src/room/schemas/room.schema";
import { MessageGateway } from "./message.gateway";
import { MessageGateWayService } from "./message.gateway.service";
import { Message, MessageSchema } from "../../message/schemas/message.schema";
import { UserRooms, UserRoomsSchema } from "src/user/schemas/userRooms.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Message.name, schema: MessageSchema },
            { name: Room.name, schema: RoomSchema },
            { name: UserRooms.name, schema: UserRoomsSchema}
        ])],
    providers: [ MessageGateWayService, MessageGateway ]
})
export class MessageGatewayModule {}