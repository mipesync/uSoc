import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/createUser.dto';
import { SignInDto } from './dto/signIn.dto';
import { JwtManager } from './jwt/jwt.manager';

@Injectable()
export class AuthService {
    constructor( @InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }

    async createUser(createUserDto: CreateUserDto): Promise<string> {
        let entity = await this.userModel.findOne({ username: createUserDto.username } || { email: createUserDto.email });

        if (entity !== null) throw new BadRequestException('Пользователь уже существует');

        createUserDto.password = await this.passwordHash(createUserDto.password);
        let user = await this.userModel.create(createUserDto);
        return user.id;
    }

    async signin(loginDto: SignInDto): Promise<any> {
        let user = await this.userModel.findOne({ username: loginDto.username });

        if (user === null) throw new NotFoundException('Пользователь не найден');
        if (loginDto.authStrategy === "jwt" && !await this.passwordValidate(loginDto.password, user.password)) throw new BadRequestException('Неверный пароль');
        
        let tokenResult = new JwtManager().generateAccessToken(user);

        let refresh_token = null;
        let refresh_token_expires = null;

        if (loginDto.rememberMe){
            let result = await new JwtManager().generateRefreshToken(user.id);
            refresh_token = result.refresh_token;
            refresh_token_expires = result.expires;
        }

        return {
            access_token: tokenResult.access_token,
            expires: tokenResult.expires,
            refresh_token: refresh_token,
            refresh_token_expires: refresh_token_expires
        }
    }    

    async updateRefreshToken(refreshToken: string){
        let tokenInfo = null;

        try {
            tokenInfo = new JwtManager().parseToken(refreshToken);
        }
        catch(e) { throw new BadRequestException(e); }
        
        let user = await this.userModel.findById(tokenInfo.userId);
        if (user === null) throw new NotFoundException('Пользователь не найден');

        let tokenResult = new JwtManager().generateAccessToken(user);
        let refreshTokenResult = await new JwtManager().generateRefreshToken(user.id);
        
        return {
            access_token: tokenResult.access_token,
            expires: tokenResult.expires,
            refresh_token: refreshTokenResult.refresh_token,
            refresh_token_expires: refreshTokenResult.expires
        }
    }

    async signInWithGoogle(data) {
        if (!data.user) throw new BadRequestException();

        let user = await this.userModel.findOne({ googleId: data.user.id });        
        if (user) return this.signin({ username: user.username, password: "", rememberMe: false, authStrategy: "google" });
    
        user = await this.userModel.findOne({ email: data.user.email });
        if (user) {
            throw new ForbiddenException("Пользователь уже существует, но аккаунт Google не привязан");
        }
    
        try {
            let newUser: User = {
                username: data.user.email,
                email: data.user.email,
                googleId: data.user.id,
                password: "google-auth",
                avatarUrl: data.user.photo
            };

            await this.userModel.create(newUser);
            return this.signin({ username: newUser.username, password: "", rememberMe: false, authStrategy: "google" });
        } catch (e) {
            throw new Error(e);
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
