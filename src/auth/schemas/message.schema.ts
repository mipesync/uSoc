import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Date, Document } from "mongoose";
import { User } from "./user.schema";

export type MessageDocument = Message & Document;

@Schema()
export class Message{
    @Prop()
    text: string;

    @Prop()
    date: Date;

    @Prop()
    to: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;
}

export const MessageSchema = SchemaFactory.createForClass(Message);