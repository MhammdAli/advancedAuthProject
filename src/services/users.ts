import logger from 'jet-logger';
import {Users,user} from '@models/users';
import {gt,isNull} from 'lodash';

export async function getUserByEmail(email : string) : Promise<user> {
    try{
        const User = await Users.findOne({email});
        return Promise.resolve(User as user);
      }catch(err : any){
        logger.err(err)
        return Promise.reject(err);
      }
}

export async function isEmailExists(email : string) : Promise<boolean>{
    try{
        const userEmail : any = await Users.findOne({email}).select('email -_id');
      
        return Promise.resolve(!isNull(userEmail));
    }catch(err){
        return Promise.reject(err);
    }
}

export async function getUserById(UID : string) : Promise<user> {
    try{
      const User = await Users.findById(UID,{password : 0});
      return Promise.resolve(User as user);
    }catch(err : any){
      return Promise.reject(err);
    }
}

export async function getPasswordById(UID : string) : Promise<user> {
    try{
        const User = await Users.findById(UID,{password : 1});
        return Promise.resolve(User as user);
      }catch(err : any){
        return Promise.reject(err);
      }
}

export async function createUser(userDoc : user) : Promise<user>{
    try{
       const User = await Users.create(userDoc) 
       return Promise.resolve(User as user);
    }catch(err : any){
       return Promise.reject(err)
    }
}

export async function deleteUser(UID : string) : Promise<boolean>{
    try{
       const result = await Users.deleteOne({UID})
       return Promise.resolve(result.acknowledged)
    }catch(err : any){
       return Promise.reject(err);
    }
}


export async function updateUser(UID : string,userDoc : user) : Promise<boolean>{
    try{
        const {acknowledged,matchedCount} = await Users.updateOne({UID},{$set : userDoc})
        return Promise.resolve(acknowledged && gt(matchedCount,0))
    }catch(err : any){
        return Promise.reject(err);
    }
}

export async function updateUserByEmail(email : string,userDoc : user) : Promise<boolean>{
    try{
        const {acknowledged,matchedCount} = await Users.updateOne({email},{$set : userDoc})
        return Promise.resolve(acknowledged && gt(matchedCount,0))
    }catch(err : any){
        return Promise.reject(err);
    }
}

export async function getUsers(page : number , pageSize : number) : Promise<Array<user>>{
    try{
        const allUsers = await Users.find().skip(page * pageSize).limit(pageSize)
        return Promise.resolve(allUsers as Array<user>)
    }catch(err : any){
        return Promise.reject(err);
    }
}