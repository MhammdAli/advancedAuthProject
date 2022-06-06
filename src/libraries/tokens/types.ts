export type userPayload = {
    UID : string,
    firstName : string,
    lastName : string,
    roles : Array<string>
    email : string,
    type : string,
    version : number
} 

export type AccessTokenPayload = {
    UID : string,
    firstName : string,
    lastName : string,
    roles : Array<string>
    email : string,
    type : string, 
    exp : number,
    iat : number
} 

export type RefreshTokenPayload = {
    UID : string, 
    version : number,
    exp : number,
    iat : number
} 

export type TOKENS = {
    ACCESS_TOKEN : string,
    REFRESH_TOKEN : string 
}

export type refreshTokenType = {
    ACCESS_TOKEN : string,
    REFRESH_TOKEN : string | null 
} 
