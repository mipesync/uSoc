import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Callback, Profile, Strategy } from "passport-yandex";

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, "yandex") {
    constructor() {
        super({            
            clientID: process.env.YANDEX_CLIENT_ID,
            clientSecret: process.env.YANDEX_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/api/auth/yandex/redirect"
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done) {
        const { id, emails, photos } = profile;
        const user = {
            id: id,
            email: emails[0].value,
            photo: photos[0].value,
            accessToken,
            refreshToken
        };
        
        done(null, user);
    }
}