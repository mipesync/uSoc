import { Controller, FileTypeValidator, Get, HttpCode, HttpStatus, Param, ParseFilePipe, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { join } from 'path';
import { concat } from 'rxjs';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService) {}
    
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
}
