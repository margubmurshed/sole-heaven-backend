import { Request, Response } from "express";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { otpServices } from "./otp.service";

const sendOTP = async(req: Request, res: Response) => {
    const {email} = req.body;
    await otpServices.sendOTP(email)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "OTP sent successfully!",
        data: null
    })
}
const verifyOTP = async(req: Request, res: Response) => {
    const {email, otp} = req.body;
    await otpServices.verifyOTP(email, otp);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "OTP verified successfully!",
        data: null
    })
}

export const otpControllers = {
    sendOTP,
    verifyOTP
}