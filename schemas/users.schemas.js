import * as z from "zod"

export const userQuerySchema = z.object({
    name: z.optional(z.string().trim().min(1))
})

export const userBodySchema = z.object({
    name: z.string().trim().min(1)
})

export const idParamsSchema = z.object({
    id: z.string().regex(/^[1-9]\d*$/).transform(val => Number(val))
})

export const authSchema = z.object({
    username: z.string().trim().min(3).max(50),
    password: z.string().min(8).refine(
        (pw) => Buffer.byteLength(pw, 'utf8') <= 72,
        { message: 'Password must be at most 72 bytes' }
    )
})