import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RoomGateway } from "./room.gateway";
import { RoomGatewayService } from "./room.gateway.service";
import { Room, RoomSchema } from "../room/schemas/room.schema";
import { User, UserSchema } from "src/user/schemas/user.schema";
import { UserRooms, UserRoomsSchema } from "src/user/schemas/userRooms.schema";

@Module({    
    imports: [
        MongooseModule.forFeature([
            { name: Room.name, schema: RoomSchema},
            { name: User.name, schema: UserSchema},
            { name: UserRooms.name, schema: UserRoomsSchema}
        ])
    ],
    providers: [ RoomGatewayService, RoomGateway ],
})
export class RoomGatewayModule {}
