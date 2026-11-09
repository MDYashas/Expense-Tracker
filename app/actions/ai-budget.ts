"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getAIBudgetSuggestions() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    // Fetch user's transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: "desc",
      },
      take: 200, // Last 200 transactions for better analysis
    })

    if (transactions.length < 5) {
      return {
        success: false,
        error: "Need at least 5 transactions for AI analysis. Keep tracking your expenses!",
      }
    }

    // Calculate monthly income from income transactions
    const incomeTransactions = transactions.filter((t: any) => t.type === "income")
    const monthlyIncome = incomeTransactions.length > 0
      ? incomeTransactions.reduce((sum: number, t: any) => sum + t.amount, 0) / 
        Math.max(new Set(incomeTransactions.map((t: any) => t.date.toISOString().slice(0, 7))).size, 1)
      : undefined

    // Format transactions for Python API
    const formattedTransactions = transactions.map((t: any) => ({
      date: t.date.toISOString().split('T')[0],
      amount: t.amount,
      category: t.category,
      type: t.type.toLowerCase(),
    }))

    // Call Python AI service
    const response = await fetch('http://localhost:5001/analyze-budget', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactions: formattedTransactions,
        monthlyIncome: monthlyIncome,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'AI service error')
    }

    const result = await response.json()
    return result

  } catch (error) {
    console.error("AI Budget Analysis Error:", error)
    
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return {
        success: false,
        error: "AI service is not running. Please start the Python service on port 5001.",
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate budget suggestions",
    }
  }
}

export async function getSpendingAnalysis() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: "desc",
      },
      take: 200,
    })

    if (transactions.length < 3) {
      return {
        success: false,
        error: "Need at least 3 transactions for analysis",
      }
    }

    const formattedTransactions = transactions.map((t: any) => ({
      date: t.date.toISOString().split('T')[0],
      amount: t.amount,
      category: t.category,
      type: t.type.toLowerCase(),
    }))

    const response = await fetch('http://localhost:5001/spending-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactions: formattedTransactions,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to analyze spending')
    }

    return await response.json()

  } catch (error) {
    console.error("Spending Analysis Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze spending",
    }
  }
}
