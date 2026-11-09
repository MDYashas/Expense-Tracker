import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.date(),
})

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.enum(["income", "expense"]),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  monthlyBudget: z.number().nonnegative("Budget must be positive or zero"),
})

export const settingsSchema = z.object({
  currency: z.string(),
  theme: z.enum(["light", "dark"]),
})
