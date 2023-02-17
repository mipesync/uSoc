import { IsDate, IsNotEmpty } from "class-validator";

export class NewMessageDto {
    @IsNotEmpty()
    text: string;

    date: string;
    
    to?: string;

    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    type: string;

    fileName: string;
    fileUrl: string;

    @IsNotEmpty()
    roomId: string;
}
