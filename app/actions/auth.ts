"use server"

import { prisma } from "@/lib/prisma"
import { registerSchema, loginSchema } from "@/lib/validations"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function registerUser(data: {
  name: string
  email: string
  password: string
  confirmPassword: string
}) {
  try {
    const validated = registerSchema.parse(data)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email }
    })

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
      }
    })

    // Create default settings
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        currency: "USD",
        theme: "light",
      }
    })

    return { success: true, user: { id: user.id, email: user.email } }
  } catch (error: any) {
    return { error: error.message || "Something went wrong" }
  }
}

export async function getUserSettings(userId: string) {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId }
    })
    return settings
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return null
  }
}
