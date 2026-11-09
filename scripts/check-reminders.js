#!/usr/bin/env node

/**
 * Bill Reminders Cron Job Script
 * 
 * This script calls the API endpoint to check and send bill reminders.
 * 
 * Setup:
 * 1. Run this script manually: node scripts/check-reminders.js
 * 2. Or schedule it with Windows Task Scheduler:
 *    - Open Task Scheduler
 *    - Create Basic Task
 *    - Name: "ExpenseTracker Bill Reminders"
 *    - Trigger: Daily at 8:00 AM
 *    - Action: Start a program
 *    - Program: C:\Program Files\nodejs\node.exe
 *    - Arguments: "D:\Github\expense tracker\scripts\check-reminders.js"
 * 
 * For production, use a service like:
 * - Vercel Cron Jobs (if deployed on Vercel)
 * - GitHub Actions with scheduled workflows
 * - External cron service (cron-job.org, EasyCron)
 */

const apiUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
const cronSecret = process.env.CRON_SECRET

async function checkBillReminders() {
  try {
    console.log('🔍 Checking for bill reminders...')
    console.log(`📡 API URL: ${apiUrl}/api/cron/bill-reminders`)

    const headers = {}
    if (cronSecret) {
      headers['Authorization'] = `Bearer ${cronSecret}`
    }

    const response = await fetch(`${apiUrl}/api/cron/bill-reminders`, {
      method: 'POST',
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to process reminders')
    }

    console.log('✅ Success!')
    console.log(`📧 Reminders sent: ${data.sent}`)
    console.log(`❌ Failed: ${data.failed}`)
    console.log(`📊 Total processed: ${data.total}`)

    return data
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Run the script
checkBillReminders()
  .then(() => {
    console.log('✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
