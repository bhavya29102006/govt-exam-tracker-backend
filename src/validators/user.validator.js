import { z } from "zod";

const registerUserSchema = z.object({
    username: z.string().trim().min(3, "username must be at least 3 characters"),
    email: z.string().trim().email("invalid email format"),
    fullname: z.string().trim().min(1, "fullname is required"),
    password: z.string().min(6, "password must be at least 6 characters")
});

const loginUserSchema = z.object({
    username: z.string().trim().optional(),
    email: z.string().trim().email("invalid email format").optional(),
    password: z.string().min(1, "password is required")
}).refine((data) => data.username || data.email, {
    message: "username or email is required"
});

const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, "old password is required"),
    newPassword: z.string().min(6, "new password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "confirm password is required")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "confirm password must be same as new password",
    path: ["confirmPassword"]
});

const updateAccountSchema = z.object({
    username: z.string().trim().min(3).optional(),
    email: z.string().trim().email("invalid email format").optional()
}).refine((data) => data.username || data.email, {
    message: "at least one of username or email is required"
});

export {
    registerUserSchema,
    loginUserSchema,
    changePasswordSchema,
    updateAccountSchema
};