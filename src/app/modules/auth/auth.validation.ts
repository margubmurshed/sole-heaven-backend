import z from "zod";

const passwordSchema = z
    .string({ invalid_type_error: "Password must be string" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
        message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
        message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
        message: "Password must contain at least 1 number.",
    })

const emailSchema = z
    .string({ invalid_type_error: "Email must be string" })
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." })

export const changePasswordZodSchema = z.object({
    oldPassword: passwordSchema,
    newPassword: passwordSchema
})

export const setPasswordZodSchema = z.object({
    password: passwordSchema
})

export const forgetPasswordZodSchema = z.object({
    email: emailSchema
})

export const credentialLoginZodSchema = z.object({
    email: emailSchema,
    password: passwordSchema
})