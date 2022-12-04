import { IsNotEmpty } from "class-validator";

export class LeaveFromRoomDto {
    @IsNotEmpty()
    roomId: string;

    @IsNotEmpty()
    userId: string;
}