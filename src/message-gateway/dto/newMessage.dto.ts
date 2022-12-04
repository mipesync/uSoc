import { IsDate, IsNotEmpty } from "class-validator";

export class NewMessageDto {
    @IsNotEmpty()
    text: string;

    @IsNotEmpty()
    @IsDate()
    date: string;
    to?: string;

    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    roomId: string;
}