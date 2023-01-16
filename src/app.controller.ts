import { Controller, Get } from '@nestjs/common';
import { AESCrypter } from './common/crypto-manager/AESCrypter';
import { DiffieHellman } from './common/crypto-manager/DiffieHellman';

@Controller()
export class AppController {
    @Get('asd')
    async asd() {
        const dh = new DiffieHellman();
        const pub1 = dh.getKey();
        
        const dh2 = new DiffieHellman();
        const pub2 = dh2.getKey();
        
        console.log('pub1', pub1);
        console.log('pub2', pub2);
        
        console.log ('Ключи на обоих концах:');
        const key1 = dh.getSecret(pub2);
        const key2 = dh2.getSecret(pub1);
        // key1 === key2
        console.log(key1);
        console.log(key2);
        
        
        const key = key1;
        const iv = '2624750004598718';
        
        const data = 'В любом компьютерном языке ввод / вывод - очень важная часть. ';
        
        const encrypted = AESCrypter.encrypt(key, iv, data);
        const decrypted = AESCrypter.decrypt(key, iv, encrypted);
        
        console.log('encrypted', encrypted);
        console.log('decrypted', decrypted);
    }
}
