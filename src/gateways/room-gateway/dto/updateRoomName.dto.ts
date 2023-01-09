import { IsNotEmpty } from "class-validator";

export class UpdateRoomNameDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    roomId: string;
}