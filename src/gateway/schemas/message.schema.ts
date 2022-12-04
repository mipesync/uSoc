import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type MessageDocument = Message & Document;

@Schema()
export class Message{
    @Prop({ required: true })
    text: string;

    @Prop({ required: true })
    date: number;

    @Prop()
    to?: string;

    @Prop({ required: true })
    userId: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);