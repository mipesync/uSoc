import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserRoomsDocument = UserRooms & Document;

@Schema()
export class UserRooms{
    @Prop({ required: true })
    roomId: string;

    @Prop({ required: true })
    role: number;

    @Prop({ required: true })
    userId: string; 

    @Prop()
    isMuted: boolean;

    @Prop()
    isPinned: boolean;
}

export const UserRoomsSchema = SchemaFactory.createForClass(UserRooms);