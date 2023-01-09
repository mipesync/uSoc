import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema()
export class User{
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop()
    avatarUrl?: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    lastActivity?: number;

    @Prop()
    googleId?: string;

    @Prop()
    yandexId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);