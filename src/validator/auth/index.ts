import { checkValidPlusRejectExistanceEmail,checkValidEmail, checkValidPasswordAndIdenticaleConfirm, checkValidName, isIn , required, checkValidPassword } from "@validator/commonValidation";
import { finalValidation, createValidationError, AUTH_ERRORS } from '@validator/index';
import {body} from 'express-validator';
import {redisClient} from '@configs/redis/connection';  
import { isEmailExists } from "@services/users";
import { eq, get } from "lodash";

export const CreateUserValidationApiInputs = [
    checkValidPlusRejectExistanceEmail({emailExistsMsg : 'Email already in use please choose another email'}),
    checkValidPasswordAndIdenticaleConfirm({unIdenticalConfirmMsg : 'password is unIdentical with confirmpassword'}),
    isIn('gender',['femail','mail'],'gender is invalid must be either femail or mail'), 
    checkValidName('firstName'),
    checkValidName('lastName'),
    required('address.street'),
    required('address.city'),
    required('address.country'),
    required('address.postalCode'),
    finalValidation,
    body('email').custom(async(email : string)=>{
         const isExists = await redisClient.exists(email); 
         if(isExists) return Promise.reject();
         return Promise.resolve();
    }).withMessage({name : 'EMAIL_ALREADY_SENT',message : 'verified code already sent please wait'}),
    finalValidation
];

export const loginValidationApiInputs = [
    checkValidEmail(),
    required('password'),
    finalValidation
]

export const refeshTokenValidationApiInputs = [
    required('refresh_token').isJWT().withMessage(createValidationError('INVALID_JWT','token is incorrect')),
    finalValidation
]

export const forgetpassowrdValidationApiInputs = [
    checkValidEmail().bail().custom(async (email : string)=>!await isEmailExists(email) ? Promise.reject() : Promise.resolve())
    .withMessage(createValidationError(AUTH_ERRORS.EMAIL_NOT_EXISTS,'email not exists')),
    checkValidPasswordAndIdenticaleConfirm({unIdenticalConfirmMsg : 'password is unIdentical'}),
    finalValidation
]
 
export const resetPasswordValidationApiInputs = [
    checkValidEmail().bail().custom(async (email : string)=>!await isEmailExists(email) ? Promise.reject() : Promise.resolve())
    .withMessage(createValidationError(AUTH_ERRORS.EMAIL_NOT_EXISTS,'email not exists')),
    required("oldpassword"),
    required("password").bail().custom((value, { req }) => !eq(value,get(req.body,'oldpassword'))).withMessage(createValidationError('SAME_PASSWORD','oldpassword must be unidentical')),
    finalValidation,
    checkValidPassword("password is weak"),
    finalValidation
]