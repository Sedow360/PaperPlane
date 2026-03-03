import {z} from 'zod';

export const messageSchema = z.object({
    content: z.string()
            .min(5, "Message should be atleast 5 characters long")
            .max(300, {message: "Message shouldn't exceed 300 characters"})
});

export const acceptMessageSchema = z.object({
    acceptMessage: z.boolean()
});