import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';
import { GoogleStrategy } from './oauth20/google.oauth20/google.strategy';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema}]),
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, GoogleStrategy]
})
export class AuthModule {}
