import nodemailer from 'nodemailer'

// Create reusable transporter using Gmail SMTP
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

// Verify transporter configuration
export async function verifyEmailConnection() {
  try {
    await transporter.verify()
    console.log('✅ Email service is ready to send messages')
    return true
  } catch (error) {
    console.error('❌ Email service error:', error)
    return false
  }
}

// Email template for bill reminder
export function getBillReminderTemplate(data: {
  userName: string
  billName: string
  amount: string
  dueDate: string
  daysUntilDue: number
  category: string
  description?: string
}) {
  return {
    subject: `⏰ Bill Reminder: ${data.billName} - Due in ${data.daysUntilDue} days`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
          }
          .bill-card {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .bill-name {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          .bill-amount {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin: 15px 0;
          }
          .bill-details {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 15px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .detail-label {
            color: #666;
            font-weight: 500;
          }
          .detail-value {
            color: #333;
            font-weight: 600;
          }
          .urgent-badge {
            display: inline-block;
            background-color: #ff6b6b;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
          }
          .warning-badge {
            display: inline-block;
            background-color: #ffa500;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 14px 30px;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .emoji {
            font-size: 48px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">💰</div>
            <h1>Bill Reminder</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #333;">Hi <strong>${data.userName}</strong>,</p>
            <p style="color: #666;">This is a friendly reminder about your upcoming bill payment:</p>
            
            ${data.daysUntilDue <= 1 ? '<div class="urgent-badge">⚠️ DUE SOON!</div>' : data.daysUntilDue <= 3 ? '<div class="warning-badge">📅 REMINDER</div>' : ''}
            
            <div class="bill-card">
              <div class="bill-name">📄 ${data.billName}</div>
              <div class="bill-amount">${data.amount}</div>
              
              <div class="bill-details">
                <div class="detail-row">
                  <span class="detail-label">Due Date:</span>
                  <span class="detail-value">${data.dueDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Days Until Due:</span>
                  <span class="detail-value" style="color: ${data.daysUntilDue <= 1 ? '#ff6b6b' : data.daysUntilDue <= 3 ? '#ffa500' : '#28a745'};">
                    ${data.daysUntilDue} ${data.daysUntilDue === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">${data.category}</span>
                </div>
                ${data.description ? `
                <div class="detail-row">
                  <span class="detail-label">Notes:</span>
                  <span class="detail-value">${data.description}</span>
                </div>
                ` : ''}
              </div>
            </div>
            
            <p style="color: #666; margin-top: 20px;">
              💡 <strong>Tip:</strong> Make sure you have sufficient funds in your account to avoid late fees.
            </p>
            
            <center>
              <a href="${process.env.NEXTAUTH_URL}/bills" class="cta-button">
                View All Bills →
              </a>
            </center>
          </div>
          <div class="footer">
            <p style="margin: 0;">
              <strong>ExpenseTracker</strong> - Your Personal Finance Manager
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
              You're receiving this because you set up a reminder for this bill.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Bill Reminder: ${data.billName}

Hi ${data.userName},

This is a reminder about your upcoming bill payment:

Bill: ${data.billName}
Amount: ${data.amount}
Due Date: ${data.dueDate}
Days Until Due: ${data.daysUntilDue} ${data.daysUntilDue === 1 ? 'day' : 'days'}
Category: ${data.category}
${data.description ? `Notes: ${data.description}` : ''}

Please ensure you have sufficient funds to avoid late fees.

Visit ${process.env.NEXTAUTH_URL}/bills to view all your bills.

---
ExpenseTracker - Your Personal Finance Manager
    `.trim(),
  }
}

// Send bill reminder email
export async function sendBillReminder({
  to,
  userName,
  billName,
  amount,
  dueDate,
  daysUntilDue,
  category,
  description,
}: {
  to: string
  userName: string
  billName: string
  amount: string
  dueDate: string
  daysUntilDue: number
  category: string
  description?: string
}) {
  try {
    const emailContent = getBillReminderTemplate({
      userName,
      billName,
      amount,
      dueDate,
      daysUntilDue,
      category,
      description,
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    })

    console.log(`✅ Bill reminder sent to ${to} for ${billName}`)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Failed to send bill reminder:', error)
    return { success: false, error: error.message }
  }
}

// Send multiple reminders (for batch processing)
export async function sendBulkReminders(reminders: Array<{
  to: string
  userName: string
  billName: string
  amount: string
  dueDate: string
  daysUntilDue: number
  category: string
  description?: string
}>) {
  const results = await Promise.allSettled(
    reminders.map(reminder => sendBillReminder(reminder))
  )

  const successful = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  console.log(`📧 Sent ${successful}/${reminders.length} reminders (${failed} failed)`)

  return {
    total: reminders.length,
    successful,
    failed,
    results,
  }
}
