import {connect , connection ,ConnectionStates ,disconnect} from 'mongoose';
import logger from 'jet-logger';
import {isUndefined} from 'lodash';

const Mongo_Instance : string | undefined = process.env.MONGO_INSTANCE;
const Mongo_DB : string | undefined = process.env.MONGO_DATABASE;
if(isUndefined(Mongo_Instance)) logger.err('MONGO_INSTANCE is missing in the environment variables')
if(isUndefined(Mongo_DB)) logger.err('MONGO_DATABASE is missing in the environment variables')

export async function Connect() : Promise<void>{

    if(isConnected()) return logger.info('already connected to mongo server')

    try{
        await connect(Mongo_Instance as string,{dbName : Mongo_DB});
        logger.info('mongo client connected successfuly')
        return Promise.resolve();
    }catch(err : any){
        logger.err(err);
        return Promise.reject(err);
    }
     
}


export async function Disconnect(){
    if(!isConnected()) return logger.info('mongo client is disconnect before')

    try{
        await disconnect();
        return Promise.resolve();
    }catch(err : any){
        logger.err(err);
        return Promise.reject(err);
    }
}

export function isConnected() : boolean{
    return connection.readyState === ConnectionStates.connected;
}
