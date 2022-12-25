import { Controller, HttpStatus } from '@nestjs/common';
import { Body, Get, HttpCode, Param, Req } from '@nestjs/common/decorators';
import { Request } from 'express';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @HttpCode(HttpStatus.OK)
    @Get('getDetails/:id')
    async getDetails(@Param('id') userId: string, @Req() req: Request) {
        let hostUrl = req.protocol.concat('://', req.headers['host']);

        let result = await this.userService.getDetails(userId, hostUrl).catch((err) => {
            throw err;
        });

        return result;
    }
}
