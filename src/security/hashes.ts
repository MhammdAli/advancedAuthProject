import {hash , compare , genSalt} from 'bcrypt';


export async function encrypt(plainText : string) : Promise<string>{
    const saltRounds = 10;
    try{
       const salt : string = await genSalt(saltRounds);
       return await hash(plainText,salt);
    }catch(err : any){
       return Promise.reject(err);
    }
}

export async function Compare(plainText : string , hashedText : string) : Promise<boolean>{
   
    try{
       return await compare(plainText , hashedText); 
    }catch(err){ 
       return Promise.reject(err);
    }
}