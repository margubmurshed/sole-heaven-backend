import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, IUser, Providers, Role } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>({
    provider: { type: String, enum: Object.values(Providers), required: true },
    providerId: { type: String, required: true }
}, {
    versionKey: false,
    _id: false
})

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: String, enum: Object.values(IsActive), default: IsActive.ACTIVE },
    isVerified: { type: Boolean, default: false },
    auths: {
        type: [authProviderSchema],
        required: true,
        validate: [
            {
                validator: function (value: IAuthProvider[]) {
                    return Array.isArray(value) && value.length > 0;
                },
                message: "At least one authentication provider is required."
            },
            {
                validator: function (value: IAuthProvider[]) {
                    const providers = value.map(v => v.provider);
                    return new Set(providers).size === providers.length; // check for duplicates
                },
                message: "Duplicate authentication providers are not allowed."
            }]
    },
}, {
    timestamps: true,
    versionKey: false
})

export const User = model<IUser>("User", userSchema);