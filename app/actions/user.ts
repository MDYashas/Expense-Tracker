"use server"

import { prisma } from "@/lib/prisma"
import { categorySchema, profileSchema, settingsSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function getCategories(userId: string) {
  try {
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" }
    })
    return categories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function createCategory(data: {
  name: string
  type: "income" | "expense"
  icon?: string
  color?: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const validated = categorySchema.parse(data)

    const category = await prisma.category.create({
      data: {
        userId: session.user.id,
        name: validated.name,
        type: validated.type,
        icon: validated.icon,
        color: validated.color,
      }
    })

    revalidatePath("/settings")
    revalidatePath("/add-transaction")

    return { success: true, category }
  } catch (error: any) {
    return { error: error.message || "Failed to create category" }
  }
}

export async function deleteCategory(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    await prisma.category.delete({
      where: { id, userId: session.user.id }
    })

    revalidatePath("/settings")
    revalidatePath("/add-transaction")

    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to delete category" }
  }
}

export async function updateProfile(data: {
  name: string
  email: string
  monthlyBudget: number
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const validated = profileSchema.parse(data)

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validated.name,
        email: validated.email,
        monthlyBudget: validated.monthlyBudget,
      }
    })

    revalidatePath("/profile")

    return { success: true, user }
  } catch (error: any) {
    return { error: error.message || "Failed to update profile" }
  }
}

export async function updateSettings(data: {
  currency: string
  theme: "light" | "dark"
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const validated = settingsSchema.parse(data)

    const settings = await prisma.userSettings.update({
      where: { userId: session.user.id },
      data: {
        currency: validated.currency,
        theme: validated.theme,
      }
    })

    revalidatePath("/settings")

    return { success: true, settings }
  } catch (error: any) {
    return { error: error.message || "Failed to update settings" }
  }
}

export async function getUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        monthlyBudget: true,
      }
    })
    return user
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}
