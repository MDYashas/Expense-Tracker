/**
 * Test Email Configuration Script
 * 
 * Run this to verify your Gmail setup is working:
 * node scripts/test-email.js
 */

require('dotenv').config()

async function testEmail() {
  console.log('🧪 Testing email configuration...\n')

  // Check environment variables
  console.log('📋 Environment Variables:')
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Missing'}`)
  console.log(`   EMAIL_APP_PASSWORD: ${process.env.EMAIL_APP_PASSWORD ? '✅ Set (${process.env.EMAIL_APP_PASSWORD.length} chars)' : '❌ Missing'}`)
  console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}\n`)

  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.error('❌ Email credentials not configured in .env file')
    console.log('\nAdd these to your .env file:')
    console.log('EMAIL_USER="your-gmail@gmail.com"')
    console.log('EMAIL_APP_PASSWORD="your-app-password"')
    process.exit(1)
  }

  try {
    // Dynamic import for ES module
    const { verifyEmailConnection, sendBillReminder } = await import('../lib/nodemailer.js')

    // Test connection
    console.log('🔌 Testing connection to Gmail SMTP...')
    const isConnected = await verifyEmailConnection()

    if (!isConnected) {
      console.error('❌ Failed to connect to Gmail')
      console.log('\nTroubleshooting:')
      console.log('1. Make sure you\'re using an App Password, not your Gmail password')
      console.log('2. Enable 2-Step Verification in Google Account settings')
      console.log('3. Generate App Password: https://myaccount.google.com/apppasswords')
      process.exit(1)
    }

    console.log('✅ Successfully connected to Gmail!\n')

    // Send test email
    console.log('📧 Sending test email...')
    const result = await sendBillReminder({
      to: process.env.EMAIL_USER, // Send to yourself
      userName: 'Test User',
      billName: 'Test Bill - Netflix Subscription',
      amount: '$15.99',
      dueDate: 'December 15, 2025',
      daysUntilDue: 3,
      category: 'Entertainment',
      description: 'This is a test email from ExpenseTracker bill reminder system.',
    })

    if (result.success) {
      console.log('✅ Test email sent successfully!')
      console.log(`📬 Check your inbox: ${process.env.EMAIL_USER}`)
      console.log('\n✨ Email configuration is working perfectly!')
    } else {
      console.error('❌ Failed to send email:', result.error)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('\nStack trace:', error.stack)
    process.exit(1)
  }
}

testEmail()
  .then(() => {
    console.log('\n🎉 All tests passed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error)
    process.exit(1)
  })
