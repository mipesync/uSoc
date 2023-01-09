import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { SignInDto } from './dto/signIn.dto';
import { GoogleAuthGuard } from './oauth20/google.oauth20/google-auth.guard';
import { YandexAuthGuard } from './oauth20/yandex.oauth20/yandex-auth.guard';

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

    @UseGuards(GoogleAuthGuard)
    @Get("google/login")
    async signInWithGoogle() {}
  
    @UseGuards(GoogleAuthGuard)
    @Get("google/redirect")
    async signInWithGoogleRedirect(@Req() req) {
        return this.authService.signInWithGoogle(req).catch((e) => {
            throw e;
        });
    }

    @UseGuards(YandexAuthGuard)
    @Get("yandex/login")
    async signInWithYandex() {}
  
    @UseGuards(YandexAuthGuard)
    @Get("yandex/redirect")
    async signInWithYandexRedirect(@Req() req) {
        return this.authService.signInWithYandex(req).catch((e) => {
            throw e;
        });        
    }
}