/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../../utils/setCookie";
import { JwtPayload } from "jsonwebtoken";
import { createUserTokens } from "../../../utils/userTokens";
import { envVariables } from "../../config/env";
import passport from "passport";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    passport.authenticate("local", (error: any, user: any, info: any) => {
        if (error) {
            return next(new AppError(error, httpStatus.UNAUTHORIZED))
        }

        if (!user) {
            return next(new AppError(info.message, httpStatus.BAD_REQUEST))
        }

        const userTokens = createUserTokens(user);

        setAuthCookie(res, userTokens);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User Logged In Successfully!",
            data: user
        })

    })(req, res, next)
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError("No refresh token found", httpStatus.BAD_REQUEST)
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);

    // setting access token in client cookie
    setAuthCookie(res, tokenInfo)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New access token created successfully!",
        data: null
    })
})

const logOut = catchAsync(async (req: Request, res: Response) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged Out Successfully!",
        data: null
    })
})

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const tokenPayload = req.user as JwtPayload;

    await AuthServices.changePassword(oldPassword, newPassword, tokenPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password has been reset successfully!",
        data: null
    })
})

const setPassword = catchAsync(async(req: Request, res: Response) => {
    const password = req.body.password;
    const jwtPayload = req.user as JwtPayload;

    await AuthServices.setPassword(jwtPayload.userId, password);

    sendResponse(res, {
        success: true,
        message: "Password has been set successfully!",
        statusCode: httpStatus.OK,
        data: null
    })
})

const forgetPassword = catchAsync(async(req: Request, res: Response) => {
    const {email} = req.body;

    await AuthServices.forgetPassword(email);

    sendResponse(res, {
        success: true,
        message: "If user exists, an email with reset password link has been set to your email.",
        statusCode: httpStatus.OK,
        data: null
    })
})

const resetPassword = catchAsync(async(req: Request, res: Response) => {
    const {password} = req.body;
    const resetPasswordToken = req.headers.authorization || req.cookies.accessToken;

    if (!resetPasswordToken) {
        throw new AppError("No access token received!", httpStatus.UNAUTHORIZED);
    }

    await AuthServices.resetPassword(password, resetPasswordToken);

    sendResponse(res, {
        success: true,
        message: "Password has been reset successfully!",
        statusCode: httpStatus.OK,
        data: null
    })
})

const googleCallbackController = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    let redirectTo = req.query.state as string || "";
    // removing / if / exists in the start of the string
    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1);
    }

    if (!user) {
        throw new AppError("User not found", httpStatus.NOT_FOUND)
    }
    const authTokens = createUserTokens(user);
    setAuthCookie(res, authTokens);
    res.redirect(`${envVariables.FRONTEND_URL}/${redirectTo}`);
})

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logOut,
    changePassword,
    setPassword,
    forgetPassword,
    resetPassword,
    googleCallbackController
}