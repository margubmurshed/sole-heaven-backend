import { Types } from "mongoose";

export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",
}

export enum IsActive{
    ACTIVE="ACTIVE",
    INACTIVE="INACTIVE",
    BLOCKED="BLOCKED"
}

export enum Providers{
    GOOGLE="GOOGLE",
    CREDENTIALS="CREDENTIALS"
}

export interface IAuthProvider {
    provider: Providers;
    providerId: string;
}

export interface IUser {
    _id: Types.ObjectId,
    name: string;
    email: string;
    password?: string;
    role: Role;
    phone: string;
    picture?: string;
    address: string;
    isDeleted?: boolean;
    isActive?: IsActive;
    isVerified?: boolean;
    auths: IAuthProvider[];
    bookings?: Types.ObjectId[];
    guides?: Types.ObjectId[];
}