import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { writeFile } from 'fs';
import { Model } from 'mongoose';
import { extname, join } from 'path';
import { concat } from 'rxjs';
import { Room, RoomDocument } from 'src/room-gateway/schemas/room.schema';
import { v4 as uuid } from 'uuid';

const _fileRootPath: string = './storage/room/avatars/'

@Injectable()
export class RoomService {    
    constructor(@InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>) { }

    async updateRoomAvatar(file: Express.Multer.File, roomId: string): Promise<string> {
        let room = await this.roomModel.findById(roomId);
        if (room === null) throw new NotFoundException('Комнаты не существует');

        let _fileName: string = `${uuid()}${extname(file.originalname)}`

        writeFile(join(_fileRootPath, _fileName), file.buffer, (err) => {
            if (err) {
                return console.log(err);
            }
        });

        room.avatarUrl = _fileName;
        room.save();

        return '/room/avatars/'.concat(_fileName);
    }
}
