import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { existsSync, mkdir, writeFile } from 'fs';
import { Error, Model } from 'mongoose';
import { extname, join } from 'path';
import { Room, RoomDocument } from 'src/room/schemas/room.schema';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MessageService {
    constructor(@InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>) {}

    async uploadFile(file: Express.Multer.File, roomId: string){
        let room = await this.roomModel.findById(roomId).catch(() => { throw new BadRequestException('Неверный формат id') });
        
        const _fileRootPath: string = `./storage/room/attachments/${roomId}/`;

        if (!existsSync(_fileRootPath)){
            await mkdir(_fileRootPath, {recursive: true}, (err) => { console.log(err)});
        }

        if (!room) throw new NotFoundException('Комнаты не существует');

        let _fileName: string = `${uuid()}${extname(file.originalname)}`

        writeFile(join(_fileRootPath, _fileName), file.buffer, (err) => {
            if (err) {
                return console.log(err);
            }
        });
        
        return {
            fileUrl: `/room/attachments/${roomId}/`.concat(_fileName),
            fileName: _fileName
        };
    }
}
