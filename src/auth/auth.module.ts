import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Message, MessageSchema } from './schemas/message.schema';
import { Room, RoomSchema } from './schemas/room.schema';
import { User, UserSchema } from './schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema},
            { name: Room.name, schema: RoomSchema},
            { name: Message.name, schema: MessageSchema}])
    ],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}
