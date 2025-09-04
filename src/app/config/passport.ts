/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVariables } from "./env";
import { User } from "../modules/user/user.model";
import { IsActive, Providers, Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import bcryptjs from "bcryptjs";

passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: "User doesn't exist" })
            }

            if (user.isActive === IsActive.BLOCKED || user.isActive === IsActive.INACTIVE) {
                return done(`User is ${user.isActive}`);
            }

            if (user.isDeleted) {
                return done("User is deleted");
            }

            if (!user.isVerified) {
                return done("User is not verified")
            }

            const isGoogleAuthenticated = user!.auths.some(providerObject => providerObject.provider === Providers.GOOGLE);

            if (isGoogleAuthenticated && !user.password) {
                return done(null, false, { message: "User is already authenticated with Google. If you want to sign in with email and password, sign in with google first, set the password from dashboard and then you can sign in through credentials" })
            }

            const isPasswordMatched = await bcryptjs.compare(password as string, user!.password as string);

            // Throwing error if password is incorrect
            if (!isPasswordMatched) {
                return done(null, false, { message: "Incorrect password" })
            }

            const responseUser = {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                picture: user.picture,
                address: user.address
            }

            return done(null, responseUser)
        } catch (error) {
            console.log(error);
            done(error);
        }
    })
)

// Google
passport.use(
    new GoogleStategy({
        clientID: envVariables.GOOGLE_CLIENT_ID,
        clientSecret: envVariables.GOOGLE_CLIENT_SECRET,
        callbackURL: envVariables.GOOGLE_CALLBACK_URL
    }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
            const email = profile.emails?.[0].value;
            if (!email) {
                return done(null, false, { message: "No email found!" })
            }
            let user = await User.findOne({ email });
            const googleProvider = {
                provider: Providers.GOOGLE,
                providerId: profile.id
            }

            if (user) {
                if (user.isActive === IsActive.BLOCKED || user.isActive === IsActive.INACTIVE) {
                    return done(`User is ${user.isActive}`);
                }

                if (user.isDeleted) {
                    return done("User is deleted");
                }

                if (!user.isVerified) {
                    return done("User is not verified")
                }
            }

            if (!user) {
                user = await User.create({
                    name: profile.displayName,
                    email,
                    picture: profile.photos?.[0].value,
                    role: Role.USER,
                    isVerified: true,
                    auths: [googleProvider]
                })
            } else {
                const doesGoogleAuthProviderExist = user.auths.some(providerObject => providerObject.provider === Providers.GOOGLE);
                if (!doesGoogleAuthProviderExist) {
                    user.auths.push(googleProvider);
                    user.isVerified = true;
                    await user.save();
                }
            }

            const responseUser = {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                picture: user.picture,
                address: user.address
            }

            return done(null, responseUser)
        } catch (error) {
            console.log("Google strategy error", error)
            return done(error)
        }
    })
)

// save user ID to session
passport.serializeUser((user: any, done: (err: any, id: any) => void) => {
    console.log("Logging in user:", user);
    done(null, user._id);
})
passport.deserializeUser(async (id: any, done: (err: any, id: any) => void) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
})



// frontend => google auth => backend localhost:5000/auth/google => passport => google oauth consent => gmail login => success => callback url backend => db store user if not exist => token