import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoomGatewayModule } from './room-gateway/room.gateway.module';
import { MessageGatewayModule } from './message-gateway/message.gateway.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: '.env'
    }),
    MongooseModule.forRoot(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASS}@cluster0.ffyokhd.mongodb.net/uSoc_DB`),
    UserModule,
    RoomGatewayModule,
    MessageGatewayModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
