import { Controller, Get } from '@nestjs/common';
import { AESCrypter } from './common/crypto-manager/AESCrypter';
import { DiffieHellman } from './common/crypto-manager/DiffieHellman';

@Controller()
export class AppController {}
