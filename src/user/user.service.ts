import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { existsSync, mkdir, unlink, writeFile } from 'fs';
import { Model } from 'mongoose';
import { extname, join } from 'path';
import { UpdateUsernameDto } from './dto/updateUsername.dto';
import { User, UserDocument } from './schemas/user.schema';
import { DetailsViewModel } from './viewModel/details.viewModel';
import { v4 as uuid } from 'uuid';
import { UserViewModel } from './viewModel/user.viewModel';

const _fileRootPath = './storage/user/avatar/';
const _filePath: string = '/user/avatar/';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

    private async getUserById(userId: string) {
        let user = await this.userModel.findById(userId).catch(e => {
            throw new BadRequestException("Неверный id");
        });
        if (!user) throw new NotFoundException('Пользователь не найден');

        return user;
    }

    async getUsers() {
        let users = await this.userModel.find();
        if (users.length === 0) throw new NotFoundException('Пользователи не найдены');

        let usersVM: UserViewModel[] = [];

        console.log(usersVM);
        

        users.forEach((user) => {
            usersVM.push({
                id: user.id,
                lastActivity: user.lastActivity,
                username: user.username
            })
        });

        return usersVM;
    }

    async getDetails(userId: string, host?: string) {
        let user = await this.getUserById(userId);

        let detailsViewModel: DetailsViewModel = {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl === undefined ? null : 
                user.avatarUrl.includes("http") ? user.avatarUrl : host?.concat('/user/avatar/', user.avatarUrl),
            lastActivity: user.lastActivity
        };

        return detailsViewModel;
    }

    async updateUsername(updateUsernameDto: UpdateUsernameDto) {
        let user = await this.getUserById(updateUsernameDto.userId);

        user.username = updateUsernameDto.newUserName;
        user.save();
    }

    async updateAvatar(userId: string, file: Express.Multer.File, host: string) {
        let user = await this.getUserById(userId);

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
        let user = await this.getUserById(userId);

        unlink(_fileRootPath + user.avatarUrl, (err) => {
            if (err){
                console.log(err);
            }
        });

        user.avatarUrl = undefined;
        user.save();
    }

    async updateActivity(userId: string) {
        let user = await this.getUserById(userId);

        user.lastActivity = Date.now();
        user.save();
    }
}
