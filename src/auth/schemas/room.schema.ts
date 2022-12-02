import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { Message } from "./message.schema";
import { User } from "./user.schema";

export type RoomDocument = Room & Document;

@Schema()
export class Room{
    @Prop()
    name: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], required: true })
    users: User[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], required: true })
    messages: Message[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);