export const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
]

export const defaultCategories = {
  income: [
    { name: "Salary", icon: "💼", color: "#10b981" },
    { name: "Freelance", icon: "💻", color: "#3b82f6" },
    { name: "Investment", icon: "📈", color: "#8b5cf6" },
    { name: "Gift", icon: "🎁", color: "#ec4899" },
    { name: "Other Income", icon: "💰", color: "#f59e0b" },
  ],
  expense: [
    { name: "Food", icon: "🍔", color: "#ef4444" },
    { name: "Transport", icon: "🚗", color: "#f97316" },
    { name: "Shopping", icon: "🛍️", color: "#ec4899" },
    { name: "Entertainment", icon: "🎮", color: "#8b5cf6" },
    { name: "Bills", icon: "📄", color: "#6366f1" },
    { name: "Health", icon: "🏥", color: "#14b8a6" },
    { name: "Education", icon: "📚", color: "#3b82f6" },
    { name: "Other Expense", icon: "💸", color: "#64748b" },
  ],
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  const currencyObj = currencies.find(c => c.code === currency)
  return `${currencyObj?.symbol || "$"}${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}
