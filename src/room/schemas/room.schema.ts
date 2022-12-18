import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type RoomDocument = Room & Document;

@Schema()
export class Room{
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    users: user[];

    @Prop()
    avatarUrl?: string;

    @Prop()
    pinned: pinned[];
}

class user {
    userId: string;
    role: number;
}

class pinned {
    userId: string;
    messageId: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);