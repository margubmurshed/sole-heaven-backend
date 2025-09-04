import { TGenericErrorResponse } from "../interfaces/error.types";
import httpStatus from "http-status-codes";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleMongooseDuplicateError = (error: any) : TGenericErrorResponse => {
    const fieldName = Object.keys(error.keyValue)[0];
    return {
        statusCode: httpStatus.CONFLICT,
        message: `Duplicate ${fieldName} entered: '${error.keyValue[fieldName]}'. Please use a different value.`
    }
}