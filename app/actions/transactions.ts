"use server"

import { prisma } from "@/lib/prisma"
import { transactionSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function createTransaction(data: {
  type: "income" | "expense"
  amount: number
  category: string
  description?: string
  date: Date
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const validated = transactionSchema.parse(data)

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: validated.type,
        amount: validated.amount,
        category: validated.category,
        description: validated.description,
        date: validated.date,
      }
    })

    revalidatePath("/dashboard")
    revalidatePath("/transactions")
    revalidatePath("/analytics")

    return { success: true, transaction }
  } catch (error: any) {
    return { error: error.message || "Failed to create transaction" }
  }
}

export async function getTransactions(userId: string, filters?: {
  type?: string
  category?: string
  startDate?: Date
  endDate?: Date
}) {
  try {
    const where: any = { userId }

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.category) {
      where.category = filters.category
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {}
      if (filters.startDate) {
        where.date.gte = filters.startDate
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" }
    })

    return transactions
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function updateTransaction(id: string, data: {
  type?: "income" | "expense"
  amount?: number
  category?: string
  description?: string
  date?: Date
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const transaction = await prisma.transaction.update({
      where: { id, userId: session.user.id },
      data
    })

    revalidatePath("/dashboard")
    revalidatePath("/transactions")
    revalidatePath("/analytics")

    return { success: true, transaction }
  } catch (error: any) {
    return { error: error.message || "Failed to update transaction" }
  }
}

export async function deleteTransaction(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    await prisma.transaction.delete({
      where: { id, userId: session.user.id }
    })

    revalidatePath("/dashboard")
    revalidatePath("/transactions")
    revalidatePath("/analytics")

    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to delete transaction" }
  }
}

export async function getDashboardStats(userId: string) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId }
    })

    const totalIncome = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    // Get monthly data for the current year
    const currentYear = new Date().getFullYear()
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date)
        return date.getFullYear() === currentYear && date.getMonth() === i
      })

      const income = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0)

      const expense = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)

      return { month, income, expense }
    })

    return { 
      totalIncome, 
      totalExpense, 
      balance, 
      monthlyData,
      transactionCount: transactions.length 
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return { totalIncome: 0, totalExpense: 0, balance: 0, monthlyData: [], transactionCount: 0 }
  }
}
