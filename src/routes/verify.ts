import { redisClient } from '@redis/connection'; 
import {Router,Request,Response} from 'express'; 
import {get,eq} from 'lodash';
import {buildTokens} from '@token/tokens';
import { createUser, updateUserByEmail } from '@services/users'; 
import { verifyApiInputs } from '@validator/verify';
const verifyRouter : Router = Router();
 
verifyRouter.get('/email/:code',verifyApiInputs,async (req : Request,res : Response)=>{

    const {code} = req.params;
    const {email} = req.query;

    try{
      const userCredintials = await redisClient.GET(email as string)
      const user = JSON.parse(userCredintials as string);
      if(!eq(get(user,'code'),code)) return res.status(401).json({name : "INCORRECT_CODE",message : 'code is incorrect'});
      
      await redisClient.DEL(email as string);

      const userPayload = await createUser({
          firstName : user.firstName,
          lastName : user.lastName,
          email : email as string,
          password : user.password,
          roles : ['default','user'],
          gender : user.gender,
          address : {
              city : "beruit",
              country : "lebanon",
              postalCode : '300',
              street : "Harouf Street"
          }, 
          phone : {
              code : '+961',
              number : '70876534'
          },
          type : 'user',
          tokenVersion : 0
      })

      const {ACCESS_TOKEN,REFRESH_TOKEN} = await buildTokens({
            UID : userPayload._id as string,
            email : userPayload.email as string,
            firstName : userPayload.firstName as string,
            lastName : userPayload.lastName as string,
            roles : userPayload.roles as string[],
            type : 'USER',
            version : userPayload.tokenVersion as number, 
      })
    
      res.json({ACCESS_TOKEN,REFRESH_TOKEN,Token_type : 'bearer'});
    }catch(err){
        res.status(500).json(err)
    }
})


verifyRouter.get('/password/:code',verifyApiInputs,async (req : Request,res : Response)=>{

    const {code} = req.params;
    const {email} = req.query;
    
    try{
        const userCredintials = await redisClient.GET(email as string)
        const payload = JSON.parse(userCredintials as string);

        if(!eq(get(payload,'code'),code)) return res.status(401).json({name : "INCORRECT_CODE",message : 'code is incorrect'});
        
        await redisClient.DEL(email as string);

        await updateUserByEmail(email as string,{
            password : payload.password as string,
        })
 
        const ttl = await redisClient.TTL(`UPDATEDPASS:${email as string}`);
       
        if(eq(ttl,-2)) await redisClient.SET(`UPDATEDPASS:${email as string}`,1,{EX : 30 * 24 * 60 * 60})
        else await redisClient.INCR(`UPDATEDPASS:${email as string}`)

        res.json({name : "PASSWORD_RESET",message : "password reset successfuly"});
        
    }catch(err){ 
        res.status(500).json(err)
    }



})

export default verifyRouter;