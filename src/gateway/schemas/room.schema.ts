import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type RoomDocument = Room & Document;

@Schema()
export class Room{
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    usersId: string[];

    @Prop()
    messagesId: string[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);