import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Providers, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../../config/env";
import hasDisallowedProperties from "../../../utils/hasDisallowedProperties";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";

const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    // Checking if user already exists or not
    const isUserExisting = await User.findOne({ email });
    if (isUserExisting) {
        throw new AppError("User Already Exists with this email", httpStatus.BAD_REQUEST);
    }

    // Hashing password
    const hashedPassword = await bcryptjs.hash(password as string, 10);

    // Creating provider
    const authProvider: IAuthProvider = {
        provider: Providers.CREDENTIALS,
        providerId: email as string
    }

    // Creating user
    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    })
    return user;
}

const updateUser = async (userId: string, payload: Partial<IUser>, tokenPayload: JwtPayload) => {
    /**
     * Other than superadmin, there are some limitation for each role
     * admin can't update role to superadmin
     * Only admin and super admin can update properties like role, isDeleted, isVerified, etc.
     * Passwords should rehashed before updating
     * Can't update email
    */

    // User and guide can only update himself
    if(tokenPayload.role === Role.USER || tokenPayload.role === Role.GUIDE){
        if(!(userId === tokenPayload.userId)){
            throw new AppError("You are not allowed to update other than yourself!", httpStatus.FORBIDDEN);
        }
    }


    const userToBeUpdated = await User.findById(userId);
    if(!userToBeUpdated){
        throw new AppError("User not found", httpStatus.NOT_FOUND);
    }
    
    // user and guide can only update allowed properties
    const allowedProperties = ["name", "password", "phone", "picture", "address"];
    if (hasDisallowedProperties(payload, allowedProperties)) {
        if (tokenPayload.role === Role.USER || tokenPayload.role === Role.GUIDE) {
            throw new AppError("You are not allowed to update specific properties!", httpStatus.FORBIDDEN);
        }
    }

    // Admin can't update super admin
    if(userToBeUpdated.role === Role.SUPER_ADMIN && tokenPayload.role === Role.ADMIN){
        throw new AppError("You are not allowed to update Super Admin!", httpStatus.FORBIDDEN);
    }

    // if password exists, hash the password
    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, Number(envVariables.BCRYPT_SALT_ROUND));
    }

    const updatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })

    if(payload.picture && userToBeUpdated.picture){
        await deleteImageFromCloudinary(userToBeUpdated.picture);
    }
    return updatedUser;

}

const getAllUsers = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(User.find(), query);
    const users = queryBuilder.filter().search(userSearchableFields).fields().sort().paginate();
    const [data, meta] = await Promise.all([
        users.build(),
        queryBuilder.getMetaData()
    ]);

    return {data, meta};
}

const getMe = async(userId: string) => {
    const user = await User.findById(userId).select("-password -updatedAt");
    return {
        data: user
    }
}

export const UserServices = {
    createUser,
    getAllUsers,
    updateUser,
    getMe
}