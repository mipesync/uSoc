import { IsNotEmpty } from "class-validator";

export class JoinToRoomDto {
    @IsNotEmpty()
    roomId: string;

    @IsNotEmpty()
    userId: string;
}