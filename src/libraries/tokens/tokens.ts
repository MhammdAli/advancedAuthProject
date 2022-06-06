import { TOKENS_ERRORS } from '@errors/tokens';
import { refreshTokenType } from './types';
import { TOKEN_EXPIRATION } from '@token/enum'; 
import _ from "lodash";
import { RefreshTokenPayload, TOKENS, AccessTokenPayload, userPayload } from '@token/types'; 
import jwt, { VerifyErrors } from "jsonwebtoken";
 

function signAccessToken(payload: AccessTokenPayload) : Promise<string> { 
    return new Promise((resolve,reject)=>{
        if(_.isUndefined(process.env.ACCESS_TOKEN_SECRET)) throw new Error("missing ACCESS_TOKEN_SECRET")
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: TOKEN_EXPIRATION.Access},(err: Error | null, encoded: string | undefined)=>{
             if(err || _.isUndefined(encoded)) return reject(err);

             resolve(encoded);
        })

    })
}
  
function signRefreshToken(payload: RefreshTokenPayload) : Promise<string> {
    
    return new Promise((resolve,reject)=>{
        if(_.isUndefined(process.env.REFRESH_TOKEN_SECRET)) throw new Error("missing REFRESH_TOKEN_SECRET")
        return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: TOKEN_EXPIRATION.Refresh},(err: Error | null, encoded: string | undefined)=>{
             if(err || _.isUndefined(encoded)) return reject(err);

             resolve(encoded);
        })

    })
    
    
}

async function buildTokens(payload : userPayload): Promise<TOKENS> {
    if(_.isUndefined(payload)) throw new Error("you have to set payload first then call build")
    try{
        const ACCESS_TOKEN = await signAccessToken(getAccessTokenPayoad(payload))
        const REFRESH_TOKEN = await signRefreshToken(getRefreshTokenPayload(payload)) 
        return Promise.resolve({ACCESS_TOKEN,REFRESH_TOKEN})
    }catch(err){
        return Promise.reject(err)
    }
}

function getAccessTokenPayoad(payload : userPayload) : AccessTokenPayload {
    return _.omit(payload,['version']) as AccessTokenPayload
}

function getRefreshTokenPayload(payload : userPayload) : RefreshTokenPayload{
    return _.pick(payload,['UID','version']) as RefreshTokenPayload
} 

// if veifed success return promise<decodedToken> if not success return reject with some errors
function verifyRefreshToken(token: string) : Promise<RefreshTokenPayload>{
    return new Promise((resolve,reject)=>{ 
        if(_.isUndefined(process.env.REFRESH_TOKEN_SECRET)) throw new Error("you must define REFRESH_TOKEN_SECRET")
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET,(err: VerifyErrors | null, decodedToken: any) => {
            if (_.isError(err)) return reject(err);

            resolve(decodedToken as RefreshTokenPayload);
        })
    }) 
}

function verifyAccessToken(token: string) : Promise<AccessTokenPayload>{
    
    return new Promise((resolve,reject)=>{ 
        if(_.isUndefined(process.env.ACCESS_TOKEN_SECRET)) throw new Error("you must define ACCESS_TOKEN_SECRET")
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err: VerifyErrors | null, decodedToken: any) => {
                if (_.isError(err)) return reject(err);

                resolve(decodedToken as AccessTokenPayload);
            })  
    }) 
     
}

async function refreshTokens(payload : userPayload,current: RefreshTokenPayload , tokenVersion: number): Promise<refreshTokenType>  {
   
    try{
        if (tokenVersion !== current.version) throw {name : TOKENS_ERRORS.TOKEN_REVOKED,message : "refresh token is revoked"}
   
        const accessPayload: AccessTokenPayload = getAccessTokenPayoad(payload);
        let refreshPayload: RefreshTokenPayload | null = null
  
        const expiration = new Date(current.exp * 1000)
        const now = new Date()
        const secondsUntilExpiration = (expiration.getTime() - now.getTime()) / 1000
     
        if (_.lt(secondsUntilExpiration,TOKEN_EXPIRATION.RefreshIfLessThan)) {
            _.set(payload as object,"version",tokenVersion)
            refreshPayload = getRefreshTokenPayload(payload);
        }
   
        const ACCESS_TOKEN : string = await signAccessToken(accessPayload) 
        const REFRESH_TOKEN : string | null = refreshPayload && await signRefreshToken(refreshPayload)
        return Promise.resolve({ACCESS_TOKEN, REFRESH_TOKEN})    
    }catch(err){
        return Promise.reject(err)
    }
    
}

// Revoke only the access token Revoking only the access token effectively forces the client to use the refresh token
// in a request to retrieve a new access token. This could be useful if, for example, you have changed a 
// user's data, and you want this information to be reflected in a new access token.
function revokeToken(forceRevokeRefreshToken = false){
    return ;
 
}



export {
    buildTokens,
    refreshTokens,
    verifyAccessToken,
    verifyRefreshToken,
   // revokeToken
}