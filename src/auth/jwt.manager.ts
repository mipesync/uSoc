import { JwtService } from "@nestjs/jwt"

export class JwtManager {
  jwtService: JwtService = new JwtService({
    secret: '375ff8a55aca72cf3a11e318d1592d2f0d3995ae',
    signOptions: { expiresIn: '7d' },
  });

  generateToken(user: any) {
    const payload = {
      username: user.username,
      userid: user.id,
    }

    return {
      access_token: this.jwtService.sign(payload),
      expires: this.addDays(7)
    }
  }

  parseToken(token: string) {
    const user = this.jwtService.verify(token)
    return user
  }

  private addDays(days : number){
    var futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return futureDate;
  }
}