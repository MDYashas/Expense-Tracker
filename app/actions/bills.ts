"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { sendBillReminder } from "@/lib/nodemailer"
import { formatCurrency } from "@/lib/constants"
import { addDays, addMonths, addWeeks, addYears, format } from "date-fns"

// Create a new recurring bill
export async function createRecurringBill(data: {
  name: string
  amount: number
  category: string
  description?: string
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  nextDueDate: Date
  reminderDays: number
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const bill = await prisma.recurringBill.create({
      data: {
        userId: session.user.id,
        name: data.name,
        amount: data.amount,
        category: data.category,
        description: data.description,
        frequency: data.frequency,
        nextDueDate: data.nextDueDate,
        reminderDays: data.reminderDays,
        isActive: true,
      }
    })

    revalidatePath("/bills")
    return { success: true, bill }
  } catch (error: any) {
    console.error("Error creating recurring bill:", error)
    return { error: error.message || "Failed to create recurring bill" }
  }
}

// Get all recurring bills for a user
export async function getRecurringBills(userId: string, filters?: {
  isActive?: boolean
  category?: string
}) {
  try {
    const where: any = { userId }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters?.category) {
      where.category = filters.category
    }

    const bills = await prisma.recurringBill.findMany({
      where,
      orderBy: { nextDueDate: "asc" }
    })

    return bills
  } catch (error) {
    console.error("Error fetching recurring bills:", error)
    return []
  }
}

// Update a recurring bill
export async function updateRecurringBill(id: string, data: {
  name?: string
  amount?: number
  category?: string
  description?: string
  frequency?: "daily" | "weekly" | "monthly" | "yearly"
  nextDueDate?: Date
  reminderDays?: number
  isActive?: boolean
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const bill = await prisma.recurringBill.update({
      where: { id, userId: session.user.id },
      data
    })

    revalidatePath("/bills")
    return { success: true, bill }
  } catch (error: any) {
    return { error: error.message || "Failed to update recurring bill" }
  }
}

// Delete a recurring bill
export async function deleteRecurringBill(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    await prisma.recurringBill.delete({
      where: { id, userId: session.user.id }
    })

    revalidatePath("/bills")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to delete recurring bill" }
  }
}

// Mark bill as paid and update next due date
export async function markBillAsPaid(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const bill = await prisma.recurringBill.findUnique({
      where: { id, userId: session.user.id }
    })

    if (!bill) {
      return { error: "Bill not found" }
    }

    // Calculate next due date based on frequency
    let nextDueDate = new Date(bill.nextDueDate)

    switch (bill.frequency) {
      case "daily":
        nextDueDate = addDays(nextDueDate, 1)
        break
      case "weekly":
        nextDueDate = addWeeks(nextDueDate, 1)
        break
      case "monthly":
        nextDueDate = addMonths(nextDueDate, 1)
        break
      case "yearly":
        nextDueDate = addYears(nextDueDate, 1)
        break
    }

    const updatedBill = await prisma.recurringBill.update({
      where: { id },
      data: {
        lastPaidDate: new Date(),
        nextDueDate,
      }
    })

    revalidatePath("/bills")
    return { success: true, bill: updatedBill }
  } catch (error: any) {
    return { error: error.message || "Failed to mark bill as paid" }
  }
}

// Check and send reminders for due bills
export async function checkAndSendReminders() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all active bills
    const bills = await prisma.recurringBill.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            settings: {
              select: {
                currency: true,
              }
            }
          }
        }
      }
    })

    const remindersToSend = []

    for (const bill of bills) {
      const dueDate = new Date(bill.nextDueDate)
      dueDate.setHours(0, 0, 0, 0)
      
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Send reminder if within reminder window
      if (daysUntilDue >= 0 && daysUntilDue <= bill.reminderDays) {
        const currency = bill.user.settings?.currency || "USD"
        
        remindersToSend.push({
          to: bill.user.email,
          userName: bill.user.name || "User",
          billName: bill.name,
          amount: formatCurrency(bill.amount, currency),
          dueDate: format(dueDate, "MMMM dd, yyyy"),
          daysUntilDue,
          category: bill.category,
          description: bill.description,
        })
      }
    }

    if (remindersToSend.length === 0) {
      console.log("📭 No bill reminders to send today")
      return { success: true, sent: 0 }
    }

    // Send all reminders
    const results = await Promise.allSettled(
      remindersToSend.map(reminder => sendBillReminder(reminder))
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(`📧 Sent ${successful}/${remindersToSend.length} bill reminders (${failed} failed)`)

    return {
      success: true,
      sent: successful,
      failed,
      total: remindersToSend.length,
    }
  } catch (error: any) {
    console.error("Error checking and sending reminders:", error)
    return { error: error.message || "Failed to process reminders" }
  }
}

// Manually trigger a reminder for a specific bill
export async function sendManualReminder(billId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const bill = await prisma.recurringBill.findUnique({
      where: { id: billId, userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            settings: {
              select: {
                currency: true,
              }
            }
          }
        }
      }
    })

    if (!bill) {
      return { error: "Bill not found" }
    }

    const today = new Date()
    const dueDate = new Date(bill.nextDueDate)
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const currency = bill.user.settings?.currency || "USD"

    const result = await sendBillReminder({
      to: bill.user.email,
      userName: bill.user.name || "User",
      billName: bill.name,
      amount: formatCurrency(bill.amount, currency),
      dueDate: format(dueDate, "MMMM dd, yyyy"),
      daysUntilDue,
      category: bill.category,
      description: bill.description,
    })

    if (!result.success) {
      return { error: result.error || "Failed to send reminder" }
    }

    return { success: true, message: "Reminder sent successfully" }
  } catch (error: any) {
    return { error: error.message || "Failed to send manual reminder" }
  }
}

// Get upcoming bills (due in next 30 days)
export async function getUpcomingBills(userId: string) {
  try {
    const today = new Date()
    const thirtyDaysFromNow = addDays(today, 30)

    const bills = await prisma.recurringBill.findMany({
      where: {
        userId,
        isActive: true,
        nextDueDate: {
          gte: today,
          lte: thirtyDaysFromNow,
        }
      },
      orderBy: { nextDueDate: "asc" }
    })

    return bills
  } catch (error) {
    console.error("Error fetching upcoming bills:", error)
    return []
  }
}
