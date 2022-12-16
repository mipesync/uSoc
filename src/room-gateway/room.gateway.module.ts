import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RoomGateway } from "./room.gateway";
import { RoomGatewayService } from "./room.gateway.service";
import { Room, RoomSchema } from "../room/schemas/room.schema";
import { User, UserSchema } from "src/auth/schemas/user.schema";

@Module({    
    imports: [
        MongooseModule.forFeature([
            { name: Room.name, schema: RoomSchema},
            { name: User.name, schema: UserSchema}
        ])
    ],
    providers: [ RoomGatewayService, RoomGateway ],
})
export class RoomGatewayModule {}
