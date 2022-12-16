import { IsNotEmpty } from "class-validator";

export class DeleteUserDto {
    @IsNotEmpty()
    origin: string;

    @IsNotEmpty()
    target: string;

    @IsNotEmpty()
    roomId: string;
    
    @IsNotEmpty()
    targetConnectionId: string;
}