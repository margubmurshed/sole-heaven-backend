import { NextFunction, Request, Response, Router } from "express";
import { AuthControllers } from "./auth.controller";
import checkAuth from "../../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import validateRequest from "../../../middlewares/validateRequest";
import { changePasswordZodSchema, credentialLoginZodSchema, forgetPasswordZodSchema, setPasswordZodSchema } from "./auth.validation";
import passport from "passport";
import { envVariables } from "../../config/env";

const router = Router();

router.post(
    "/login",
    validateRequest(credentialLoginZodSchema),
    AuthControllers.credentialsLogin
)

router.post(
    "/logout",
    AuthControllers.logOut
)

router.post(
    "/refresh-token",
    AuthControllers.getNewAccessToken
)

router.post(
    "/change-password",
    checkAuth(...Object.values(Role)),
    validateRequest(changePasswordZodSchema),
    AuthControllers.changePassword
)

router.post(
    "/set-password",
    checkAuth(...Object.values(Role)),
    validateRequest(setPasswordZodSchema),
    AuthControllers.setPassword
)

router.post(
    "/forget-password",
    validateRequest(forgetPasswordZodSchema),
    AuthControllers.forgetPassword
)

router.post(
    "/reset-password",
    validateRequest(setPasswordZodSchema),
    AuthControllers.resetPassword
)

router.get(
    "/google",
    (req: Request, res: Response, next: NextFunction) => {
        const redirect = req.query.redirect || "/";
        passport.authenticate("google", {
            scope: ["profile", "email"],
            state: redirect as string
        })(req, res, next);
    }
)

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: `${envVariables.FRONTEND_URL}/login?message="There is some issue with your account. Please contact the support team."` }), AuthControllers.googleCallbackController
)

export const AuthRoutes = router;