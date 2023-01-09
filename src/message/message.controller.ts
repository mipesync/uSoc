import { Controller, HttpCode, HttpStatus, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { MessageService } from './message.service';

@UseGuards(JwtAuthGuard)
@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Post('uploadFile/:roomId') 
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(HttpStatus.OK)
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Param('roomId') roomId: string, @Req() req: Request) {
        let result = await this.messageService.uploadFile(file, roomId).catch((err) => {
            throw err;
        });
        result.fileUrl = req.protocol.concat('://', req.headers['host'], result.fileUrl);

        return result;
    }
}
