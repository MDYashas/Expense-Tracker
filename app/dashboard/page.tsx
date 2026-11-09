import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DashboardNav } from "@/components/dashboard-nav"
import { getDashboardStats } from "@/app/actions/transactions"
import { getUserSettings } from "@/app/actions/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/constants"
import { MonthlyChart } from "@/components/monthly-chart"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const stats = await getDashboardStats(session.user.id)
  const settings = await getUserSettings(session.user.id)
  const currency = settings?.currency || "USD"

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name}! Here&apos;s your financial overview.
          </p>
        </div>

        {/* AI Budget Banner */}
        {stats.transactionCount >= 5 && (
          <Card className="mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">🤖</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">AI Budget Suggestions</h3>
                    <p className="text-sm text-muted-foreground">
                      Get personalized budget recommendations powered by machine learning
                    </p>
                  </div>
                </div>
                <Link href="/ai-budget">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    View AI Insights
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalIncome, currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time income</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <span className="text-2xl">💸</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalExpense, currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <span className="text-2xl">📊</span>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(stats.balance, currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Current balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Income and expenses for the current year
            </p>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={stats.monthlyData} currency={currency} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
