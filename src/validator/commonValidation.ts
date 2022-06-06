import { redisClient } from '@configs/redis/connection';
import { isEmailExists } from '@services/users';
import { createValidationError , AUTH_ERRORS , check} from '@validator/index';
import { ValidationChain, Location, Meta } from 'express-validator';
import { eq, isArray, join, isUndefined, gte } from 'lodash';
import {NextFunction , Request , Response} from 'express';
import { toDays, toDaysMinutesSeconds, toHours, toMinutes, toSecond } from '@utils/converter';

/***********************************************************************************
 *                                Email common Validations
 **********************************************************************************/
export function checkValidEmail(message = 'email is invalid',location : Location = 'body') : ValidationChain{ 
    return check('email',location).trim().normalizeEmail({all_lowercase : true}).isEmail({})
    .withMessage(
        createValidationError(AUTH_ERRORS.INVALID_EMAIL,message)
    )
} 
export function checkValidPlusRejectExistanceEmail(msg : {invalidEmailMsg ?: string,emailExistsMsg : string},location : Location = 'body') : ValidationChain{
    return checkValidEmail(msg.invalidEmailMsg,location).bail().custom(async (email : string)=>await isEmailExists(email) ? Promise.reject() : Promise.resolve())
    .withMessage(createValidationError(AUTH_ERRORS.EMAIL_ALREADY_IN_USE,msg.emailExistsMsg))
}


/***********************************************************************************
 *                                password common Validations
 **********************************************************************************/
export function checkValidPassword(message = 'password is invalid',location : Location = 'body') : ValidationChain{
    return check('password',location).isStrongPassword({
        minLength : 8,minLowercase : 1,minUppercase : 1,minSymbols : 2,minNumbers : 2
    }).withMessage(createValidationError(AUTH_ERRORS.WEAK_PASSWORD,message))
}
export function checkValidPasswordAndIdenticaleConfirm(msg : {invalidPasswordMsg ?: string,unIdenticalConfirmMsg : string},location : Location = 'body') : ValidationChain{
    return checkValidPassword(msg.invalidPasswordMsg,location).bail().custom((password : string,meta : Meta)=>eq(password , meta.req.body.confirmPassword))
    .withMessage(createValidationError(AUTH_ERRORS.UNIDENTICAL_PASSWORD,msg.unIdenticalConfirmMsg))
} 

export function bandFrequentlyChangingPassword(redisKey : string,maxNbOfChanging : number){
    return async (req : Request,res : Response,next : NextFunction)=>{
        const key = `${redisKey}${req.body.email as string}`
    
       const result = await redisClient.GET(key);
    
       if(gte(result,maxNbOfChanging)){
           const ttl = await redisClient.TTL(key); 
           return res.status(401).json({
               name : `UNAUTHORIZED_RESET_PASSWORD`,
               message : `Unauthorized to change password please wait ${toDaysMinutesSeconds(ttl)}`,
               remainingTime : {
                   days : toDays(ttl),
                   hours : toHours(ttl),
                   minutes : toMinutes(ttl),
                   seconds : toSecond(ttl)
               }
            })
       }
       next();
    }
}

/***********************************************************************************
 *                                other common Validations
 **********************************************************************************/
export function checkValidName(fields : string | string[],location : Location = 'body') : ValidationChain{
    return check(fields,location).isString().isLength({min : 2,max : 15}).
    withMessage(createValidationError(AUTH_ERRORS.INVALID_NAME,`${isArray(fields) ? join(fields,' , ') : fields} must be between 2 and 15 characters`))
}
export function isIn(fields : string | string[],In : string[] | number[],message: string,location : Location = 'body') : ValidationChain{
     return check(fields,location).toLowerCase().isIn(In).withMessage(createValidationError('INVALID_VALUE',message))
}
export function required(fields : string | string[],message ?: string,location : Location = 'body') : ValidationChain{
    return check(fields,location).exists().withMessage(createValidationError('MISSING_FIELD',isUndefined(message) ? `${isArray(fields) ? join(fields,' , ') : fields} is required` : message))
}

 