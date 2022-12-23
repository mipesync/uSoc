import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class SendMessageDto {
    @IsNotEmpty({ message: 'Поле не должно быть пустым'})
    @IsString({ message: 'Поле должно быть строкой'})
    roomId: string;

    @IsNotEmpty({ message: 'Поле не должно быть пустым'})
    @IsString({ message: 'Поле должно быть строкой'})
    userId: string;

    @IsNotEmpty({ message: 'Поле не должно быть пустым'})
    @IsDate({ message: 'Поле должно быть датой'})
    date: string;

    to?: string;
}