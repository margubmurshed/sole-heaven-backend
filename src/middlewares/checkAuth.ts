import { NextFunction, Request, Response } from "express";
import { IsActive, Role } from "../app/modules/user/user.interface";
import AppError from "../app/errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVariables } from "../app/config/env";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../app/modules/user/user.model";

const checkAuth = (...authRoles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const accessToken = req.cookies.accessToken;

            if (!accessToken) {
                throw new AppError("No access token received!", httpStatus.UNAUTHORIZED);
            }

            const payload = verifyToken(accessToken, envVariables.JWT_ACCESS_SECRET) as JwtPayload;

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

            if(!user.isVerified){
                throw new AppError("User is not verified", httpStatus.UNAUTHORIZED)
            }

            // Checking whether requested client role matches any of allowed roles
            if (!authRoles.includes(payload.role)) {
                throw new AppError("You are not permitted to access this route!", httpStatus.UNAUTHORIZED)
            }

            req.user = payload;

            next();
        } catch (error) {
            next(error)
        }
    }
}

export default checkAuth;