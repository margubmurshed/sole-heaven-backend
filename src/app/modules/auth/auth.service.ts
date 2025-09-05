/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { checkResetPasswordTokenAndUser, createNewAccessTokenUsingRefreshToken } from "../../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../../config/env";
import { IAuthProvider, IsActive, Providers } from "../user/user.interface";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../../utils/sendEmail";

const getNewAccessToken = async (refreshToken: string) => {
    const accessToken = await createNewAccessTokenUsingRefreshToken(refreshToken);

    return { accessToken };
}

const changePassword = async (oldPassword: string, newPassword: string, tokenPayload: JwtPayload) => {
    if (oldPassword === newPassword) {
        throw new AppError("New password can't be same as old password!", httpStatus.BAD_REQUEST);
    }

    const user = await User.findById(tokenPayload.userId);
    const isPasswordMatched = await bcryptjs.compare(oldPassword, user?.password as string);

    if (!isPasswordMatched) {
        throw new AppError("Password is incorrect!", httpStatus.BAD_REQUEST);
    }

    const newHashedPassword = await bcryptjs.hash(newPassword, Number(envVariables.BCRYPT_SALT_ROUND));

    user!.password = newHashedPassword;
    user!.save();
}

const setPassword = async (userId: string, password: string) => {

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("The user you are trying to update is not found", httpStatus.NOT_FOUND);
    }

    // email-password user / google already set pass user/ google not set password user

    if (user.password) {
        throw new AppError("You have already set your password. Now you can change your password from your profile.", httpStatus.BAD_REQUEST)
    }

    const hashedPassword = await bcryptjs.hash(password, Number(envVariables.BCRYPT_SALT_ROUND));

    const newAuthProvider: IAuthProvider = {
        provider: Providers.CREDENTIALS,
        providerId: user.email
    }

    user.auths.push(newAuthProvider);
    user.password = hashedPassword;

    await user.save();
}

const forgetPassword = async (email: string) => {
    const user = await User.findOne({ email });

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

    const jwtPayload = {
        userId: user._id,
        email: email,
        role: user.role
    }

    const token = jwt.sign(jwtPayload, envVariables.JWT_RESET_PASSWORD_SECRET, {
        expiresIn: "10m"
    })

    const resetPasswordLink = `${envVariables.FRONTEND_URL}/reset-password?token=${token}`;

    await sendEmail({
        to: email,
        subject: "Reset Password",
        templateName: "forgetPassword",
        templateData: {
            name: user.name,
            resetLink: resetPasswordLink
        }
    })
}

const resetPassword = async(password: string, resetPasswordToken:string) => {
    const payload = await checkResetPasswordTokenAndUser(resetPasswordToken);
    const hashedPassword = await bcryptjs.hash(password, Number(envVariables.BCRYPT_SALT_ROUND));

    await User.findByIdAndUpdate(payload.userId, {password: hashedPassword});
}

export const AuthServices = {
    getNewAccessToken,
    changePassword,
    setPassword,
    forgetPassword,
    resetPassword
}