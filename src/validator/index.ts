import {validationResult , ValidationError,ValidationChain,Location} from 'express-validator';
import {get,eq} from 'lodash';
import {Request , Response , NextFunction} from 'express';
import {errorType} from '@validator/types';
import {body , query , param , header , cookie} from 'express-validator';
 
export enum AUTH_ERRORS {
    INVALID_EMAIL = 'INVALID_EMAIL', 
    EMAIL_NOT_EXISTS = 'EMAIL_NOT_EXISTS',
    EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
    WEAK_PASSWORD = 'WEAK_PASSWORD',
    WRONG_PASSWORD = 'WRONG_PASSWORD',
    UNIDENTICAL_PASSWORD = 'UNIDENTICAL_PASSWORD',
    INVALID_NAME = 'INVALID_NAME'
}


export function createValidationError(name : string , message : string) : errorType {
    return { name , message }
}

export function check(fields : string | string[],location : Location) : ValidationChain{
    if(eq(location,'query')) return query(fields);
    else if(eq(location,'params')) return param(fields);
    else if(eq(location , 'cookie')) return cookie(fields);
    else if(eq(location, 'headers')) return header(fields);
    else return body(fields);
}
  
export const validateResult = validationResult.withDefaults({formatter : (error : ValidationError)=>{
    return {
        message : get(error,'msg.message',error.msg),
        value   : get(error ,'value'),
        name    : get(error ,'msg.name')
    }
}})

export const finalValidation = (req : Request , res : Response,next : NextFunction)=>{
     const errors = validateResult(req); 
     if(errors.isEmpty()) return next();
    
     return res.status(422).json({errors : errors.mapped()});
}

