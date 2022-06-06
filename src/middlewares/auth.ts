import { AccessTokenPayload } from '@token/types';
import {Request,Response,NextFunction} from 'express';
import {split,get,isUndefined,nth,set} from 'lodash';
import {verifyAccessToken} from '@token/tokens';
export type AuthRequest = Request & { user ?: AccessTokenPayload }
export function isAuth(){
    return (req : Request,res : Response , next : NextFunction)=>{
        const auth = split(get(req.headers,"authorization"),' '); 
    
        const accessToken = nth(auth,1)
        
        if(isUndefined(accessToken)) return res.status(401).json({name : 'MISSING_ACCESS_TOKEN',message : 'access token is required'});
    
        verifyAccessToken(accessToken).then((user)=>{
            set(req,'user',user);
            next();
        })
        .catch(err=>{
            res.status(401).json({name : "UNAUTHORIZED",message : get(err,'message')})
        });
             
    }
}