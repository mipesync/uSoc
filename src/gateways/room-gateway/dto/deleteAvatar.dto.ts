import { IsNotEmpty } from "class-validator";

export class DeleteAvatarDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    roomId: string;
}