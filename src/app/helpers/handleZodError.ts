import { ZodError } from "zod"
import { TGenericErrorResponse } from "../interfaces/error.types";
import httpStatus from "http-status-codes";

export const handleZodError = (error: ZodError) : TGenericErrorResponse => {
    const errorSources = error.issues.map(issue => ({
            path: issue.path.reverse().join(" inside "), // Get the last part of the path
            message: issue.message
        }))

    return{
        statusCode: httpStatus.BAD_REQUEST,
        message: "Zod Validation Error",
        errorSources
    }
}