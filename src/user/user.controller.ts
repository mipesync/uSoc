import { Controller, FileTypeValidator, HttpStatus, ParseFilePipe } from '@nestjs/common';
import { Body, Delete, Get, HttpCode, Param, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UpdateUsernameDto } from './dto/updateUsername.dto';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
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

    @HttpCode(HttpStatus.OK)
    @Get('getUsers')
    async getUsers() {
        let users = await this.userService.getUsers().catch((err) => {
            throw err;
        });

        return users;
    }

    @HttpCode(HttpStatus.OK)
    @Put('updateUsername')
    async updateUsername(@Body() updateUsernameDto: UpdateUsernameDto) {
        await this.userService.updateUsername(updateUsernameDto).catch((err) => {
            throw err;
        });
    }

    @HttpCode(HttpStatus.OK)
    @Put('updateAvatar/:id')
    @UseInterceptors(FileInterceptor('file'))
    async updateAvatar(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new FileTypeValidator({ fileType: /\/(jpg|jpeg|png)$/ }),
            ],
        }),) file: Express.Multer.File, @Param('id') userId: string, @Req() req: Request) {
        let hostUrl = req.protocol.concat('://', req.headers['host']);

        let avatarUrl = await this.userService.updateAvatar(userId, file, hostUrl).catch((err) => {
            throw err;
        });

        return {
            avatarUrl: avatarUrl
        };
    }

    @HttpCode(HttpStatus.OK)
    @Delete('deleteAvatar/:id')
    async deleteAvatar(@Param('id') userId: string) {
        await this.userService.deleteAvatar(userId).catch((err) => {
            throw err;
        });
    }
}
