import { Router } from "express";
import { otpControllers } from "./otp.controller";
import validateRequest from "../../../middlewares/validateRequest";
import { sendOTPZodSchema, verifyOTPZodSchema } from "./otp.validation";

const router = Router();

router.post("/send", validateRequest(sendOTPZodSchema), otpControllers.sendOTP);
router.post("/verify", validateRequest(verifyOTPZodSchema), otpControllers.verifyOTP);

export const OTPRoutes = router;