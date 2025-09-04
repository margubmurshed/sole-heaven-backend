import { Response } from "express";

interface AuthTokens{
    accessToken?: string;
    refreshToken?: string;
}
export const setAuthCookie = (res: Response, authTokens: AuthTokens) => {
    if(authTokens.accessToken){
        res.cookie("accessToken", authTokens.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
    }
    if(authTokens.refreshToken){
        res.cookie("refreshToken", authTokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
    }
}