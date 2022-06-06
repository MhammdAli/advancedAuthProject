/* eslint-disable @typescript-eslint/no-misused-promises */
// import { AccessTokenPayload } from '@token/types';
// import { resetPasswordValidationApiInputs } from '@validator/auth/index';
import { buildTokens, refreshTokens, verifyRefreshToken } from '@token/tokens'; 
import {Router , Request , Response} from "express"; 
import { omit, get, set } from 'lodash';
import {generateRandomCode} from "@utils/random";
import {redisClient} from '@redis/connection'; 
import { user } from "@models/users";
import {SendEmail} from '@mailer/index'; 
import {getPasswordById, getUserByEmail, getUserById, updateUser} from '@services/users';
import { CreateUserValidationApiInputs , forgetpassowrdValidationApiInputs, loginValidationApiInputs, refeshTokenValidationApiInputs, resetPasswordValidationApiInputs} from "@validator/auth";
import { Compare } from '@security/hashes'; 
import { createValidationError, AUTH_ERRORS } from '@validator/index'; 
import { bandFrequentlyChangingPassword } from '@validator/commonValidation';
import {AuthRequest, isAuth} from '@middelwares/auth';
const authRouter = Router();

authRouter.post('/',CreateUserValidationApiInputs,async (req:Request<unknown,unknown,user>,res : Response)=>{
     
    const code = generateRandomCode(6);

    const serializeBody : string = JSON.stringify(set(omit(req.body,['email','confirmPassword']),'code',code));
    await redisClient.SET(get(req.body,'email') as string,serializeBody,{EX : 10 * 60})
    
    try{
        await new SendEmail()
        .to(req.body.email as string)
        .setSubject(`Hello ${req.body.firstName as string}`)
        .setHtml(`
            You registered an account on [customer portal], before being able to use your account you need to verify that this is your email address. 
            <b>verifiecation code : ${code}</b>  
        `)
        .send()
        res.json({name : 'VERIFY_EMAIL',message : 'wait for the message to verify email'})
    }catch(err){
        res.status(500).json({name : 'SERVER_ERROR',message : 'something wen\'t wrong'});
    }     
 
})


authRouter.post('/login',loginValidationApiInputs,async (req : Request,res : Response)=>{
    try{
       const user = await getUserByEmail(req.body.email as string)
       if(!await Compare(req.body.password as string,user.password as string)) return res.status(401).json(createValidationError(AUTH_ERRORS.WRONG_PASSWORD,'password is wrong'))
       
       const {ACCESS_TOKEN,REFRESH_TOKEN} = await buildTokens({
           UID : user._id as string,
           email : user.email as string,
           firstName : user.firstName as string,
           lastName : user.lastName as string,
           roles : user.roles as string[],
           type : 'user',
           version : user.tokenVersion as number
       })

       res.json({ACCESS_TOKEN,REFRESH_TOKEN,Token_type : 'bearer'})
    }catch(err){
        res.status(422).json(createValidationError('EMAIL_NOT_EXISTS','email not exists please create account first'))
    }
})

authRouter.post("/refeshToken",refeshTokenValidationApiInputs,async (req : Request , res : Response)=>{
    const {refresh_token} = req.body;
    try{
      const decodedRefreshToken = await verifyRefreshToken(refresh_token as string);
      const user = await getUserById(get(decodedRefreshToken,'UID'));
      const {ACCESS_TOKEN,REFRESH_TOKEN} = await refreshTokens({
          UID : user._id as string,
          email : user.email as string,
          firstName : user.firstName as string,
          lastName : user.lastName as string,
          roles : user.roles as string[],
          version : user.tokenVersion as number,
          type :user.type as string
      },decodedRefreshToken,user.tokenVersion as number);
    
      res.json({ACCESS_TOKEN,REFRESH_TOKEN,Token_type : "bearer"})

    }catch(err){
       res.status(401).json(err);
    } 
})

 
authRouter.patch("/forgetpassword",forgetpassowrdValidationApiInputs,bandFrequentlyChangingPassword('UPDATEDPASS:',3),async (req : Request,res:Response)=>{

    const code = generateRandomCode(6);
    const userPayload = {
        password : req.body.password,
        code
    }
    
    try{
        await redisClient.SET(get(req.body,'email') as string,JSON.stringify(userPayload),{EX : 10 * 60})
        await new SendEmail()
        .to(req.body.email as string)
        .setSubject(`Hello Sir`)
        .setHtml(` 
            Trouble signing in?

            Resetting your password is easy.

            Just take the verification code below and verify the code.
            ${code} 
        `)
        .send()
        
        res.json({name : 'VERIFY_EMAIL',message : 'wait for email message to verify the identity'})
    }catch(err){
        res.status(500).json(err);
    }

}) 


authRouter.post("/resetpassword",[isAuth()],resetPasswordValidationApiInputs,bandFrequentlyChangingPassword('UPDATEDPASS:',3), async (req : AuthRequest, res : Response)=>{
     

    const {
       password,
       oldpassword
    } = req.body;

    const user = await getPasswordById(req.user?.UID as string);

   
    if(!await Compare(oldpassword as string,user.password as string)) {
        return res.status(401).json(createValidationError(AUTH_ERRORS.WRONG_PASSWORD,'password is wrong'))
    }
   
    try{
        await updateUser(user._id as string,{
            password : password
        }) 
        res.json({name : "PASSWORD_UPDATED",message : "password updated successfuly"});
    }catch(err){
        res.json({})
    }

  
})



 
 

export default authRouter;