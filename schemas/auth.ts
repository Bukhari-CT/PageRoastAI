// /home/bukhari/work/PageRoastAI/schemas/auth.ts

import * as z from "zod";

/**
 * Common password rules for reuse
 */
const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

/**
 * Signup Schema
 */
export const signupSchema = z
    .object({
        firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
        lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
        email: z.string().email("Please enter a valid email address"),
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

/**
 * Login Schema
 */
export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z
    .object({
        newPassword: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type SignupValues = z.infer<typeof signupSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
