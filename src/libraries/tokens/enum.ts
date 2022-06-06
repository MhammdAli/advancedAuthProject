enum TOKEN_EXPIRATION {
    Access = 1 * 60 * 60, // 1 hour 
    Refresh = 7 * 24 * 60 * 60, // 7 days
    RefreshIfLessThan = 4 * 24 * 60 * 60, // 4 days
}

export {
    TOKEN_EXPIRATION
}