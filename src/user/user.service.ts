import { Injectable } from '@nestjs/common';
import { writeFile } from 'fs';

@Injectable()
export class UserService {
    

    async updateAvatar(file: Express.Multer.File): Promise<string> {
        await writeFile(`./src/avatar/${file.filename}`, file.buffer, (error) => console.error(error.message));
        return `./src/avatar/${file.filename}`;
    }
}
