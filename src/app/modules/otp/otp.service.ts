import crypto from "crypto";
import { redisClient } from "../../config/redis.config";
import { sendEmail } from "../../../utils/sendEmail";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";

const OTP_EXPIRATION_TIME = 120;

const generateOTP = (length = 6) => {
    return crypto.randomInt(10 ** (length - 1), 10 ** length);
}

const sendOTP = async (email: string) => {
    const user = await User.findOne({email});
    if(!user) throw new AppError("User not found", httpStatus.NOT_FOUND);
    if(user.isVerified) throw new AppError("You are already verified!", httpStatus.BAD_REQUEST);

    const otp = generateOTP();
    const redisKey = `otp:${email}`

    await redisClient.set(redisKey, otp, {
        expiration: { type: "EX", value: OTP_EXPIRATION_TIME }
    })

    await sendEmail({
        to: email,
        subject: "OTP for PH Tour Management System Login",
        templateName: "otp",
        templateData: {
            logoUrl: "https://i.ibb.co.com/99n30ccq/logo.png",
            date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
            name: user.name,
            otp
        }
    })
}

const verifyOTP = async (email: string, otp: string) => {

    const user = await User.findOne({email});
    if(!user) throw new AppError("User not found", httpStatus.NOT_FOUND);
    if(user.isVerified) throw new AppError("You are already verified!", httpStatus.BAD_REQUEST);

    const redisKey = `otp:${email}`;
    const savedOTP = await redisClient.get(redisKey);

    if (!savedOTP) throw new AppError("Invalid OTP", httpStatus.UNAUTHORIZED);
    if (savedOTP !== otp) throw new AppError("Invalid OTP", httpStatus.UNAUTHORIZED)

    Promise.all([
        User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
        redisClient.del(redisKey)
    ])
}

export const otpServices = {
    sendOTP,
    verifyOTP
}