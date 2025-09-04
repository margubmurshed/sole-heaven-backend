import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../app/config/env";
import { IsActive, IUser } from "../app/modules/user/user.interface";
import { generateToken, verifyToken } from "./jwt";
import { User } from "../app/modules/user/user.model";
import AppError from "../app/errorHelpers/AppError";
import httpStatus from "http-status-codes";

export const createUserTokens = (user: Partial<IUser>) => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    }

    const accessToken = generateToken(jwtPayload, envVariables.JWT_ACCESS_SECRET, envVariables.JWT_ACCESS_EXPIRES);
    const refreshToken = generateToken(jwtPayload, envVariables.JWT_REFRESH_SECRET, envVariables.JWT_REFRESH_EXPIRES);

    return { accessToken, refreshToken };
}

export const createNewAccessTokenUsingRefreshToken = async (refreshToken: string) => {

    const jwtPayload = verifyToken(refreshToken, envVariables.JWT_REFRESH_SECRET) as JwtPayload;

    const user = await User.findById(jwtPayload.userId);

    if (!user) {
        throw new AppError("User doesn't exist", httpStatus.BAD_REQUEST);
    }

    if (user.isActive === IsActive.BLOCKED || user.isActive === IsActive.INACTIVE) {
        throw new AppError(`User is ${user.isActive}`, httpStatus.BAD_REQUEST);
    }

    if (user.isDeleted) {
        throw new AppError("User is deleted", httpStatus.BAD_REQUEST);
    }

    const accessToken = generateToken(jwtPayload, envVariables.JWT_REFRESH_SECRET, envVariables.JWT_REFRESH_EXPIRES);

    return accessToken;
}

export const checkResetPasswordTokenAndUser = async (resetPasswordToken: string) => {

    const payload = verifyToken(resetPasswordToken, envVariables.JWT_RESET_PASSWORD_SECRET) as JwtPayload;

    const user = await User.findById(payload.userId);
    if (!user) {
        throw new AppError("User doesn't exist", httpStatus.BAD_REQUEST);
    }

    if (user.isActive === IsActive.BLOCKED || user.isActive === IsActive.INACTIVE) {
        throw new AppError(`User is ${user.isActive}`, httpStatus.BAD_REQUEST);
    }

    if (user.isDeleted) {
        throw new AppError("User is deleted", httpStatus.BAD_REQUEST);
    }

    if (!user.isVerified) {
        throw new AppError("User is not verified", httpStatus.BAD_REQUEST)
    }

    return payload;
}