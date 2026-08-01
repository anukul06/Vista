import { z } from 'zod'

export const yearEnum = z.enum(['FIRST', 'SECOND', 'THIRD', 'FOURTH'])

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  rollNumber: z.string().trim().min(2, 'Roll number is required').max(40),
  department: z.string().trim().min(2, 'Department is required').max(80),
  year: yearEnum,
  githubUsername: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9-]{1,39}$/, 'Invalid GitHub username')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
