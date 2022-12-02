import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    constructor(){}

    @Get('/setUser')
    setUser(){
    }

    @Get('/setRoom')
    setRoom(){
    }

    @Get('/setMsg')
    async setMsg(){
    }
}