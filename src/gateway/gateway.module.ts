import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppGateway } from "./gateway";
import { GatewayService } from "./gateway.service";
import { Message, MessageSchema } from "./schemas/message.schema";
import { Room, RoomSchema } from "./schemas/room.schema";

@Module({    
    imports: [
        MongooseModule.forFeature([
            { name: Room.name, schema: RoomSchema},
            { name: Message.name, schema: MessageSchema}])
    ],
    providers: [GatewayService, AppGateway],
})
export class GatewayModule {}
