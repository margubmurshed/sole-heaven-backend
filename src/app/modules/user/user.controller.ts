import { Request, Response } from "express";
import httpStatus from "http-status-codes"
import { UserServices } from "./user.service";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { IUser } from "./user.interface";

const createUser = catchAsync(async (req: Request, res: Response) => {
    const payload: IUser = {
        ...req.body,
        picture: req.file?.path
    }
    const user = await UserServices.createUser(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User created successfully!",
        data: user
    })
})

const updateUser = catchAsync(async(req: Request, res:Response) => {
    const userId = req.params.id;
    const tokenPayload = req.user;
    const payload: Partial<IUser> = {
        ...req.body,
        picture: req.file?.path
    }
    const updatedUser = await UserServices.updateUser(userId, payload, tokenPayload as JwtPayload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User updated successfully!",
        data: updatedUser
    })
})

const getAllUsers = catchAsync(async(req:Request, res:Response) => {
    const query = req.query as Record<string, string>;
    const result = await UserServices.getAllUsers(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All users retrieved successfully!",
        data: result.data,
        meta: result.meta
    })
})

const getMe = catchAsync(async(req:Request, res:Response) => {
    const jwtPayload = req.user as JwtPayload;
    const userId = jwtPayload.userId;
    const result = await UserServices.getMe(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Logged in user data retrieved successfully!",
        data: result.data
    })
})

export const UserControllers = {
    createUser,
    getAllUsers,
    updateUser,
    getMe
}