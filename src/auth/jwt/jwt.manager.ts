import { JwtService } from "@nestjs/jwt"

export class JwtManager {
	createJwtService(expires: string): JwtService {
		return new JwtService({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: expires },
		});
	}

	generateAccessToken(user: any) {
		let jwtService = this.createJwtService('30m');

		const payload = {
			username: user.username,
			userid: user.id,
		}

		return {
			access_token: jwtService.sign(payload),
			expires: this.addMinutes(30)
		}
	}

	async generateRefreshToken(userId: string) {
		let jwtService = this.createJwtService('7d');

		const payload = {
			userId: userId,
			type: 'refresh_token'
		}

		return {
			refresh_token: jwtService.sign(payload),
			expires: this.addDays(7)
		};
	}

	parseToken(token: string) {
		let jwtService = this.createJwtService('30m');

		const user = jwtService.verify(token);
		return user;
	}

	private addMinutes(minutes : number){
		var futureDate = new Date();
		futureDate.setMinutes(futureDate.getMinutes() + minutes);
		return futureDate;
	}

	private addDays(days : number){
		var futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + days);
		return futureDate;
	}
}