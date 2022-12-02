import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtManager } from './jwt.manager';

@Injectable()
export class AuthService {
    constructor( @InjectModel(User.name) private readonly userModel: Model<UserDocument> ) { }

    async createUser(createUserDto: CreateUserDto): Promise<string> {
        let entity = await this.userModel.findOne({ username: createUserDto.username } || { email: createUserDto.email });

        if (entity !== null) throw new ConflictException().message = 'Пользователь уже существует';

        createUserDto.password = await this.passwordHash(createUserDto.password);
        let user = await this.userModel.create(createUserDto);
        return user.id;
    }

    async signin(loginDto: SignInDto): Promise<any> {
        let user = await this.userModel.findOne({ username: loginDto.username });

        if (user === null) throw new NotFoundException().message = 'Пользователь не найден';
        if (!await this.passwordValidate(loginDto.password, user.password)) throw new BadRequestException().message = 'Неверный пароль';

        let tokenResult = new JwtManager().generateToken(user);

        return { 
            userId: user.id,
            access_token: tokenResult.access_token,
            expires: tokenResult.expires
        }
    }

    private async passwordValidate(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    private async passwordHash(password: string): Promise<string> {
        let salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    }
}
