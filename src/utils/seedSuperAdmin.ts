import { envVariables } from "../app/config/env"
import AppError from "../app/errorHelpers/AppError";
import { IAuthProvider, IUser, Providers, Role } from "../app/modules/user/user.interface";
import { User } from "../app/modules/user/user.model";
import bcryptjs from "bcryptjs";

const seedSuperAdmin = async () => {
    const superAdminEmail = envVariables.SUPER_ADMIN_EMAIL;
    const superAdminPassword = envVariables.SUPER_ADMIN_PASS;

    try {
        // Checking if superAdmin already exists or not
        const superAdmin = await User.findOne({ email: superAdminEmail });

        // Stops here if any user with super admin email is already created
        if (superAdmin && superAdmin?.role !== Role.SUPER_ADMIN){
            throw new AppError(`Already an ${superAdmin?.role} is created with super admin email`, 403);
        }

        // Stops here if super admin is already exists
        if (superAdmin && superAdmin?.role === Role.SUPER_ADMIN) {
            console.log("Super Admin already exists!");
            return;
        }

        // Hashing password
        const hashedPassword = await bcryptjs.hash(superAdminPassword, Number(envVariables.BCRYPT_SALT_ROUND));

        // Creating provider
        const authProvider: IAuthProvider = {
            provider: Providers.CREDENTIALS,
            providerId: superAdminEmail as string
        }

        const payload: Partial<IUser> = {
            name: "Super Admin",
            email: superAdminEmail,
            password: hashedPassword,
            role: Role.SUPER_ADMIN,
            isVerified: true,
            auths: [authProvider]
        }

        const data = await User.create(payload);
        console.log("Super Admin created successfully!");
        console.log(data);

    } catch (error) {
        console.log(error)
    }
}

export default seedSuperAdmin;