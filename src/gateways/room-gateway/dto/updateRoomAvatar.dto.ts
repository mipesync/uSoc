import { IsNotEmpty } from "class-validator";

export class UpdateRoomAvatarDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    roomId: string;

    @IsNotEmpty()
    avatarUrl: string;
}