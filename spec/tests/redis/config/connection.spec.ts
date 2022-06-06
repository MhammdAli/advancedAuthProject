import {redisClient} from '@redis/connection';
 
describe('check redis connection if it is working sucessfuly',()=>{

    it("check redis connection",(done)=>{
        
        redisClient.connect()
        .then(()=>{
            redisClient.PING()
            .then((result : string)=>{ 
                expect(result).toBe("PONG");
                done();
            }) 
        })
        
    })

  

})