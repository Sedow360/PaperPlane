import {z} from 'zod';

export const usernameValidation = z
    .string()
    .min(3, "Username must be atleast 3 characters long")
    .max(10, "Username must be atmost 10 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username should not have special characters");

export const signUpSchema = z.object({
    username: usernameValidation,
    password: z.string()
                .min(3, {message: "Password should be atleast 3 characters long"})
                .max(10, {message: "Password should be atmost 10 characters long"})
                .regex(/^[a-zA-Z0-9]+$/, "Username should not have special characters"),
    email: z.string().email({message: "Invalid email address"})
});

export const signInSchema = z.object({
    identifier: z.string(),
    password: z.string()
});

export const verifySchema = z.object({
    code: z.string().length(6, {message: "Verification code must of 6 digits"})
});