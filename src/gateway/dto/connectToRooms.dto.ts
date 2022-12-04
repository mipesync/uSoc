import { IsNotEmpty } from "class-validator";

export class ConnectToRoomsDto {
    @IsNotEmpty()
    userId: string;
}