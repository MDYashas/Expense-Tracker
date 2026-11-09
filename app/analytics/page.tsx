import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { getTransactions } from "@/app/actions/transactions"
import { getUserSettings } from "@/app/actions/auth"
import { AnalyticsClient } from "./analytics-client"

export default async function AnalyticsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const transactions = await getTransactions(session.user.id)
  const settings = await getUserSettings(session.user.id)
  const currency = settings?.currency || "USD"

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Visualize your spending and income patterns</p>
        </div>

        <AnalyticsClient transactions={transactions} currency={currency} />
      </main>
    </div>
  )
}
