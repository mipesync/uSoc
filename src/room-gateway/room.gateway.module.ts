import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RoomGateway } from "./room.gateway";
import { RoomGatewayService } from "./room.gateway.service";
import { Room, RoomSchema } from "./schemas/room.schema";

@Module({    
    imports: [
        MongooseModule.forFeature([
            { name: Room.name, schema: RoomSchema}])
    ],
    providers: [ RoomGatewayService, RoomGateway ],
})
export class RoomGatewayModule {}
