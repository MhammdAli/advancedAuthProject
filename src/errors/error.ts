import createError from "http-errors";

export class HttpErrors extends createError.HttpError {

 
    static createError(status : number , payload : Array<object> | object){
        
        return {
            status,
            payload
        }
    }
    

}