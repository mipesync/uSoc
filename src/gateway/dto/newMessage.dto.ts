import { IsDate, IsNotEmpty } from "class-validator";

export class NewMessage {
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