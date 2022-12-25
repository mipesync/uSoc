import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { DetailsViewModel } from './viewModel/details.viewModel';

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
            avatarUrl: user.avatarUrl === undefined ? null : host.concat('/user/avatar/', user.avatarUrl)
        };

        return detailsViewModel;
    }
}
