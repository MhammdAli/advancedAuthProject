import * as redis from 'redis';
import logger from 'jet-logger';
import _ from 'lodash';

const redis_Instance : string | undefined = process.env.REDIS_INSTANCE;
if(_.isUndefined(redis_Instance)) logger.err('REDIS_INSTANCE is missing in the environment variables')

export const redisClient : redis.RedisClientType = redis.createClient({ 
    url : redis_Instance,
}) 

export async function redisConnect(){
    try{
        await redisClient.connect();
        logger.info('redis is connected successfuly');
    }catch(err){
        logger.err(err);
    }
}


