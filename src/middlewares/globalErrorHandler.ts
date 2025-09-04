/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
import { NextFunction, Request, Response } from "express";
import { envVariables } from "../app/config/env";
import AppError from "../app/errorHelpers/AppError";
import { ZodError } from "zod";
import httpStatus from "http-status-codes";
import { TErrorSource } from "../app/interfaces/error.types";
import { handleMongooseDuplicateError } from "../app/helpers/handleMongooseDuplicateError";
import { handleMongooseValidationError } from "../app/helpers/handleMongooseValidationError";
import { handleMongooseCastError } from "../app/helpers/handleMongooseCastError";
import { handleZodError } from "../app/helpers/handleZodError";
import { deleteImageFromCloudinary } from "../app/config/cloudinary.config";

export const globalErrorHandler = async(error: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    let message = "Something went wrong!";
    let errorSources: TErrorSource[] = [];

    if(req.file){
        await deleteImageFromCloudinary(req.file.path);
    }

    if(req.files && Array.isArray(req.files) && req.files.length > 0){
        const paths = req.files.map(file => file.path);
        await Promise.all(paths.map(path => deleteImageFromCloudinary(path)));
    }

    if (error.code === 11000) {
        const errorObject = handleMongooseDuplicateError(error);
        statusCode = errorObject.statusCode;
        message = errorObject.message;
    } else if (error.name === "ValidationError") {
        const errorObject = handleMongooseValidationError(error);
        statusCode = errorObject.statusCode;
        message = errorObject.message;
        errorSources = errorObject.errorSources as TErrorSource[];
    } else if (error.name === "CastError") {
        const errorObject = handleMongooseCastError(error);
        statusCode = errorObject.statusCode;
        message = errorObject.message;
    } else if (error instanceof ZodError) {
        const errorObject = handleZodError(error);
        statusCode = errorObject.statusCode;
        message = errorObject.message;
        errorSources = errorObject.errorSources as TErrorSource[];
    } else if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
    } else if (error instanceof Error) {
        message = error.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        error: envVariables.NODE_ENV === "development" ? error : null,
        stack: envVariables.NODE_ENV === "development" ? error?.stack : null
    })
}