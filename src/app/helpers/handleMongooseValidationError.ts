import mongoose from "mongoose";
import { TErrorSource, TGenericErrorResponse } from "../interfaces/error.types";
import httpStatus from "http-status-codes";

export const handleMongooseValidationError = (error: mongoose.Error.ValidationError) : TGenericErrorResponse => {
    const validationErrors = Object.values(error.errors);
    const errorSources: TErrorSource[] = validationErrors.map((errorObject: mongoose.Error.ValidatorError | mongoose.Error.CastError) => ({
        path: errorObject.path,
        message: errorObject.message
    }));
    return {
        statusCode: httpStatus.BAD_REQUEST,
        message: "Mongoose Validation Error",
        errorSources
    }
}