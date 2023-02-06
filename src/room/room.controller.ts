import { Body, Controller, FileTypeValidator, Get, HttpCode, HttpStatus, Param, ParseFilePipe, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { JwtManager } from 'src/auth/jwt/jwt.manager';
import { MuteRoomDto } from './dto/muteRoom.dto';
import { PinRoomDto } from './dto/pimRoom.dto';
import { UpdatePermsDto } from './dto/updatePerms.dto';
import { RoomService } from './room.service';

@UseGuards(JwtAuthGuard)
@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService, private readonly jwtManager: JwtManager) {}
    
    @HttpCode(HttpStatus.OK)
    @Post('updateAvatar/:id')
    @UseInterceptors(FileInterceptor('file'))
    async updateAvatar(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new FileTypeValidator({ fileType: /\/(jpg|jpeg|png)$/ }),
            ],
        }),) file: Express.Multer.File, @Param('id') roomId: string, @Req() req: Request) {

        let fileUrl = await this.roomService.updateRoomAvatar(file, roomId);
        let response = req.protocol.concat('://', req.headers['host'], fileUrl);

        return {fileUrl: response};
    }

    @HttpCode(HttpStatus.OK)
    @Put('givePerms')
    async givePerms(@Body() updatePermsDto: UpdatePermsDto){
        await this.roomService.givePerms(updatePermsDto).catch((err) => {
            throw err;
        });
    }

    @HttpCode(HttpStatus.OK)
    @Put('takePerms')
    async takePerms(@Body() updatePermsDto: UpdatePermsDto){
        await this.roomService.takePerms(updatePermsDto).catch((err) => {
            throw err;
        });
    }

    @HttpCode(HttpStatus.OK)
    @Get('getInviteLink/:roomId')
    async getInviteLink(@Param('roomId') roomId: string, @Req() req: Request) {
        return req.protocol.concat('://', req.headers['host'], `/join?roomId=${roomId}`);
    }

    @HttpCode(HttpStatus.OK)
    @Get('roomDetails/:roomId')
    async getRoomDetails(@Param('roomId') roomId: string, @Req() req: Request) {
        let result = await this.roomService.getRoomDetails(roomId).catch((err) => {
            throw err;
        });
        result.avatarUrl = req.protocol.concat('://', req.headers['host'], result.avatarUrl);

        return result;
    }

    @HttpCode(HttpStatus.OK)
    @Get('members/:roomId')
    async getMembers(@Param('roomId') roomId: string) {
        let result = await this.roomService.getRoomMembers(roomId).catch((err) => {
            throw err;
        });

        return result;
    }

    @HttpCode(HttpStatus.OK)
    @Get('attachments/:roomId')
    async getAttachments(@Param('roomId') roomId: string, @Req() req: Request) {
        const host = req.headers['host'];
        let result = await this.roomService.getRoomAttachs(roomId).catch((err) => {
            throw err;
        });

        return result;
    }

    @HttpCode(HttpStatus.OK)
    @Get('roomChat/:roomId')
    async getRoomChat(@Param('roomId') roomId: string, @Req() req: Request) {
        let result = await this.roomService.getRoomChat(roomId).catch((err) => {
            throw err;
        });
        result.avatarUrl = req.protocol.concat('://', req.headers['host'], result.avatarUrl);

        return result;
    }

    @HttpCode(HttpStatus.OK)
    @Put('muteRoom')
    async muteRoom(@Body() muteRoomDto: MuteRoomDto) {
        await this.roomService.muteRoom(muteRoomDto).catch((err) => {
            throw err;
        });
    }

    @HttpCode(HttpStatus.OK)
    @Put('unmuteRoom')
    async unmuteRoom(@Body() muteRoomDto: MuteRoomDto) {
        await this.roomService.unmuteRoom(muteRoomDto).catch((err) => {
            throw err;
        });
    }

    @HttpCode(HttpStatus.OK)
    @Get('getUserRooms')
    async getUserRooms(@Req() req: Request) {
        const jwt = req.headers['authorization'].replace('Bearer ', '\0');
        const payloadUser = this.jwtManager.decodeToken(jwt);
        
        const host = req.protocol.concat('://', req.headers['host']);
        let rooms = await this.roomService.getUserRooms(payloadUser.userid, host).catch((err) => {
            throw err;
        });

        return rooms;
    }

    @HttpCode(HttpStatus.OK)
    @Put('pinRoom')
    async pinRoom(@Body() pinRoomDto: PinRoomDto) {
        await this.roomService.pinRoom(pinRoomDto).catch((err) => {
            throw err;
        });
    }

    @HttpCode(HttpStatus.OK)
    @Put('unpinRoom')
    async unpinRoom(@Body() pinRoomDto: PinRoomDto) {
        await this.roomService.unpinRoom(pinRoomDto).catch((err) => {
            throw err;
        });
    }
}
