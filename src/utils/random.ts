import {randomBytes} from 'crypto';

export function generateRandomCode(size: number) : string{
    return randomBytes(size).toString('hex');
}