import { AccessTokenPayload, RefreshTokenPayload ,TOKENS , userPayload} from '@token/types';
import { buildTokens,refreshTokens,verifyAccessToken } from '@token/tokens';  
import {TOKEN_EXPIRATION} from "@token/enum";
import {decode} from "jsonwebtoken";
import _ from 'lodash';
import { TOKENS_ERRORS } from '@errors/tokens';
 
describe('check if we return accessToken and refreshToken in body if it is working successfuly', () => {
 

    const user : userPayload = {
        firstName : "mohammad",
        lastName : "Ali",
        type : "student",
        email : "mohammad@gmail.com",
        roles : [
            "student",
            "defualt"
        ],
        UID : "jdwiusdhuedued",
        version : 10
    }

    type userRedis = {
        version : number
    }
    const HashRedisCache : userRedis = {version : 0}


    beforeAll(()=>{
        _.set(HashRedisCache,user.UID,{
            version : user.version
        })
    })
    it(`check if access Token expired on ${TOKEN_EXPIRATION.Access} and RefreshToken expired on ${TOKEN_EXPIRATION.Refresh} `,()=>{
        buildTokens(user)
        .then((res : TOKENS)=>{
            console.log(res)
            const decodedAccessToken = decode(res.ACCESS_TOKEN) as AccessTokenPayload;
            const decodedRefreshToken = decode(res.REFRESH_TOKEN) as RefreshTokenPayload;
            expect(decodedAccessToken.exp - decodedAccessToken.iat).toBe(TOKEN_EXPIRATION.Access)
            expect(decodedRefreshToken.exp - decodedRefreshToken.iat).toBe(TOKEN_EXPIRATION.Refresh) 
        })
        .catch((err : Error)=>{
             //expect(err).toBe(2)
             console.log(err)
        })
    
    });


    it("check if access token is verfied succesfuly",async ()=>{
        const {ACCESS_TOKEN} = await buildTokens(user)
        const verifiedToken = await verifyAccessToken(ACCESS_TOKEN)
        expect(verifiedToken.email).toBe(user.email)
    })

    it("check if wrong accessToken throw an error",()=>{
        const fakeAccessToken = "jwdkejdiejidh3h93hd93dh3d300h3hxh03hx30hx"; 
        verifyAccessToken(fakeAccessToken)
        .catch(err=>{
            expect(err.name).toBe("JsonWebTokenError")
        })
    })

    it("check if refreshToken generate an access Token",async ()=>{

        const decodedFakeRefeshToken : RefreshTokenPayload = {
            exp : 2223,
            iat : 33,
            UID : user.UID,
            version : user.version
        }
  

        try{
            const redisVersion : number | undefined = (_.get(HashRedisCache,decodedFakeRefeshToken.UID) as userRedis).version;
            
            const {ACCESS_TOKEN} = await refreshTokens(user,decodedFakeRefeshToken,redisVersion)
            
            expect(ACCESS_TOKEN).toBeTruthy();
            
        }catch(err){
            null;
        }

    })

    it("check if different Versions of refreshtoken throw an error",()=>{

        const decodedFakeRefeshToken : RefreshTokenPayload = {
            exp : 2223,
            iat : 33,
            UID : user.UID,
            version : user.version
        }
  
           // update token to simulate revoked refreshToken
           _.set(HashRedisCache,user.UID,{
              version : user.version + 1
           })

 
            const redisVersion : number | undefined = (_.get(HashRedisCache,decodedFakeRefeshToken.UID) as userRedis).version;
            
            refreshTokens(user,decodedFakeRefeshToken,redisVersion)
            .catch(err=>{
                expect(err.name).toBe(TOKENS_ERRORS.TOKEN_REVOKED);
            })
      

    })

    const days = TOKEN_EXPIRATION.RefreshIfLessThan / 60 / 60 / 24;
    const refreshTokenInDays = TOKEN_EXPIRATION.Refresh  / 60 / 60 / 24
    it(`check if refresh Token return null if the exp time of refresh token exceed the possible day and the possible day is ${refreshTokenInDays - days} days`,async ()=>{
 
        const now : Date = new Date();
        
        const TwoDays = 2  * 24 * 60 * 60;
        const decodedFakeRefeshToken : RefreshTokenPayload = {
            exp : (now.getTime() / 1000 + TOKEN_EXPIRATION.Refresh) - TwoDays,
            iat : 33,
            UID : user.UID,
            version : 10
        }
   
        const redisVersion : number | undefined = (_.get(HashRedisCache,decodedFakeRefeshToken.UID) as userRedis).version;
             
        try{
            decodedFakeRefeshToken.version = redisVersion
            const {REFRESH_TOKEN} = await refreshTokens(user,decodedFakeRefeshToken,redisVersion)
            expect(REFRESH_TOKEN).toBeNull();
        }catch(err){
             console.log(err.name)
        }

    })

    


})


  