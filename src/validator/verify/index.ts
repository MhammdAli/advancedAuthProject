
import { checkValidEmail } from '@validator/commonValidation';
import {redisClient} from '@redis/connection';
import {param,query} from 'express-validator';

import { finalValidation} from '@validator/index';
export const verifyApiInputs = [
    param('code').exists().withMessage({name : 'INVALID_CODE',message : 'code is invalid'}),
    checkValidEmail('email','query'),
    finalValidation,
    query('email').custom(async(email : string)=>{
        const isExists = await redisClient.exists(email); 
        if(!isExists) return Promise.reject();
        return Promise.resolve();
   }).withMessage({name : 'NONE_CODE_EXISTS',message : 'please create user in order to verify your account '}),
   finalValidation
]