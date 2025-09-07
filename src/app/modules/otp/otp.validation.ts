import z from "zod";

export const sendOTPZodSchema = z.object({
    email: z
        .string({ invalid_type_error: "Email must be string" })
        .email({ message: "Invalid email address format." })
        .min(5, { message: "Email must be at least 5 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." }),
})
export const verifyOTPZodSchema = z.object({
    otp: z
        .string({ invalid_type_error: "OTP must be a string" })
        .regex(/^\d{6}$/, { message: "OTP must be exactly 6 digits" }),
    email: z
        .string({ invalid_type_error: "Email must be string" })
        .email({ message: "Invalid email address format." })
        .min(5, { message: "Email must be at least 5 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." }),
})