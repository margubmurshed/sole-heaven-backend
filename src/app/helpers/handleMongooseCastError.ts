import mongoose from "mongoose"
import { TGenericErrorResponse } from "../interfaces/error.types";
import httpStatus from "http-status-codes";

export const handleMongooseCastError = (error: mongoose.Error.CastError) : TGenericErrorResponse => {
    return {
        statusCode: httpStatus.BAD_REQUEST,
        message: `Invalid MongoDB ${error.path}: '${error.value}'. Provide a valid MongoDB ObjectId value.`
    }
}