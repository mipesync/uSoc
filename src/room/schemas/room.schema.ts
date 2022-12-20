import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { MutedLookup } from "../lookup/muted.lookup";
import { PinnedLookup } from "../lookup/pinned.lookup";

export type RoomDocument = Room & Document;

@Schema()
export class Room{
    @Prop({ required: true })
    name: string;

    @Prop()
    avatarUrl?: string;

    @Prop()
    pinned: PinnedLookup[];

    @Prop()
    muted: MutedLookup[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);