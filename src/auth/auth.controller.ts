import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('/sign-up')
    async signUp(@Body() createUserDto: CreateUserDto): Promise<any> {
        let result = await this.authService.createUser(createUserDto);
        return { userId: result };
    }

    @Post('/sign-in')
    async signIn(@Body() signInDto: SignInDto): Promise<any> {
        let result = await this.authService.signin(signInDto);
        return {
            userId: result.userId,
            access_token: result.access_token,
            expires: result.expires
        };
    }
}