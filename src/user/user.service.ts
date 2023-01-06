import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { existsSync, mkdir, unlink, writeFile } from 'fs';
import { Model } from 'mongoose';
import { extname, join } from 'path';
import { UpdateUsernameDto } from './dto/updateUsername.dto';
import { User, UserDocument } from './schemas/user.schema';
import { DetailsViewModel } from './viewModel/details.viewModel';
import { v4 as uuid } from 'uuid';

const _fileRootPath = './storage/user/avatar/';
const _filePath: string = '/user/avatar/';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

    async getDetails(userId: string, host: string) {
        let user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('Пользователь не найден');

        let detailsViewModel: DetailsViewModel = {
            id: user.id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl === undefined ? null : 
                user.avatarUrl.includes("http") ? user.avatarUrl : host.concat('/user/avatar/', user.avatarUrl)
        };

        return detailsViewModel;
    }

    async updateUsername(updateUsernameDto: UpdateUsernameDto) {
        let user = await this.userModel.findById(updateUsernameDto.userId);
        if (!user) throw new NotFoundException('Пользователь не найден');

        user.username = updateUsernameDto.newUserName;
        user.save();
    }

    async updateAvatar(userId: string, file: Express.Multer.File, host: string) {
        let user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('Пользователь не найден');

        let _fileName: string = `${uuid()}${extname(file.originalname)}`
        
        if (!existsSync(_fileRootPath)){
            await mkdir(_fileRootPath, {recursive: true}, (err) => { console.log(err)});
        }

        writeFile(join(_fileRootPath, _fileName), file.buffer, (err) => {
            if (err) {
                return console.log(err);
            }
        });

        unlink(_fileRootPath + user.avatarUrl, (err) => {
            if (err) {
                console.log(err);
            }
        });

        user.avatarUrl = _fileName;
        user.save();

        return host.concat(_filePath, _fileName);
    }

    async deleteAvatar(userId: string) {
        let user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('Пользователь не найден');

        unlink(_fileRootPath + user.avatarUrl, (err) => {
            if (err){
                console.log(err);
            }
        });

        user.avatarUrl = undefined;
        user.save();
    }
}
