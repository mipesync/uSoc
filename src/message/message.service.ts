import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { existsSync, mkdir, writeFile } from 'fs';
import { Model } from 'mongoose';
import { basename, extname, join } from 'path';
import { Room, RoomDocument } from 'src/room/schemas/room.schema';

@Injectable()
export class MessageService {
    constructor(@InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>) {}

    async uploadFile(file: Express.Multer.File, roomId: string){
        let room = await this.roomModel.findById(roomId).catch(() => { throw new BadRequestException('Неверный формат id') });
        if (!room) throw new NotFoundException('Комнаты не существует');
        
        const _fileRootPath: string = `./storage/room/attachments/${roomId}/`;
        if (!existsSync(_fileRootPath)){
            await mkdir(_fileRootPath, {recursive: true}, (err) => { console.log(err)});
        }

        let _fileName: string = file.originalname;
        if (existsSync(_fileRootPath + _fileName)){
            _fileName = this.fileNameIncrement(_fileRootPath, _fileName);
        }

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

    fileNameIncrement(filePath: string, originalName: string): string {
        let fileExt = extname(originalName);
        let newFileName: string = null;
        let iter = 1;
        while(true) {
            newFileName = `${basename(originalName, fileExt)}_${iter}${fileExt}`
            if (!existsSync(filePath + newFileName)) {
                break;
            }
            iter++;
        }

        return newFileName;
    }
}
