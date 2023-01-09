import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";
import { JwtManager } from "src/auth/jwt/jwt.manager";
import { UserService } from "src/user/user.service";

@Injectable()
export class OnlineMiddleware implements NestMiddleware {
    constructor(private readonly userService: UserService,
        private readonly jwtManager: JwtManager) {}

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            const jwt = req.headers['authorization'].replace('Bearer ', '\0');
            const payloadUser = this.jwtManager.decodeToken(jwt);        
            await this.userService.updateActivity(payloadUser.userid);
            next();
        }
        catch(err) {
            next();
        }
    }
}