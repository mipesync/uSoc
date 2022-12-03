import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { SignInDto } from './dto/signIn.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @HttpCode(HttpStatus.OK)
    @Post('/sign-up')
    async signUp(@Body() createUserDto: CreateUserDto): Promise<any> {
        let result = await this.authService.createUser(createUserDto).catch((e) => {
            throw e;
        });

        return { userId: result };
    }

    @HttpCode(HttpStatus.OK)
    @Post('/sign-in')
    async signIn(@Body() signInDto: SignInDto): Promise<any> {
        let result = await this.authService.signin(signInDto).catch((e) => {
            throw e;
        });
        
        return {
                access_token: result.access_token,
                expires: result.expires,
                refresh_token: result.refresh_token,
                refresh_token_expires: result.refresh_token_expires
            };
    }

    @HttpCode(HttpStatus.OK)
    @Get('update-refresh-token')
    async updateRefreshToken(@Query('token') refresh_token: string): Promise<any>{
        let result = await this.authService.updateRefreshToken(refresh_token).catch((e) => {
            throw e;
        });
        
        return {
                access_token: result.access_token,
                expires: result.expires,
                refresh_token: result.refresh_token,
                refresh_token_expires: result.refresh_token_expires
            };
    }
}