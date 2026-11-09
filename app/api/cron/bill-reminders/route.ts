import { NextResponse } from "next/server"
import { checkAndSendReminders } from "@/app/actions/bills"
import { verifyEmailConnection } from "@/lib/nodemailer"

export const dynamic = 'force-dynamic'

// API endpoint to manually trigger bill reminders check
// Can be called by a cron job or scheduled task
export async function GET(request: Request) {
  try {
    // Optional: Add authentication/authorization here
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify email service is working
    const emailReady = await verifyEmailConnection()
    if (!emailReady) {
      return NextResponse.json(
        { error: "Email service not configured properly" },
        { status: 500 }
      )
    }

    // Check and send reminders
    const result = await checkAndSendReminders()

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Bill reminders processed successfully",
      sent: result.sent,
      failed: result.failed,
      total: result.total,
    })
  } catch (error: any) {
    console.error("Error in bill reminders cron:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// POST endpoint for manual trigger
export async function POST(request: Request) {
  return GET(request)
}
