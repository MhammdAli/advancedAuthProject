//SaveOptions
import { Schema , Model,models , model, CallbackWithoutResultAndOptionalError} from 'mongoose';
import {encrypt} from '@security/hashes'; 
import { has , get } from 'lodash';

export interface user {
    _id ?: string,
    firstName ?: string,
    lastName ?: string,
    email ?: string,
    password ?: string,
    gender ?: string,
    address ?: {
        postalCode ?: string,
        street ?: string,
        city ?: string,
        country ?: string
    },
    phone ?: {
        code : string,
        number : string
    },
    roles ?: Array<string>,
    type ?: "user" | "teacher" | "admin" | 'student',
    tokenVersion ?: number
}

const userSchema : Schema = new Schema<user>({ 
    firstName : String,
    lastName  : String,
    address : {
        postalCode : String,
        street     : String,
        city       : String,
        country    : String
    },
    email    : String,
    password : String,
    gender   : String,
    roles    : [String],
    phone    : String,
    tokenVersion : Number,
    type : String
},{
    timestamps : true, 
    validateBeforeSave : false
})


userSchema.pre("save",async function(next: CallbackWithoutResultAndOptionalError){
    this.password = await encrypt(this.password as string); 
    next();

})

userSchema.pre("updateOne",async function (next : CallbackWithoutResultAndOptionalError){
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const updatedDoc = get(this.getUpdate(),"$set")
    if(has(updatedDoc,'password')) updatedDoc.password = await encrypt(updatedDoc.password as string);
  
    next();
})

export const Users : Model<user> = models.Users || model('Users',userSchema); 
