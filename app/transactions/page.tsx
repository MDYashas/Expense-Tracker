"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getTransactions, deleteTransaction } from "@/app/actions/transactions"
import { getUserSettings } from "@/app/actions/auth"
import { formatCurrency, formatDate } from "@/lib/constants"

export default function TransactionsPage() {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState("USD")
  const [filter, setFilter] = useState({
    type: "all",
    category: "all",
  })

  useEffect(() => {
    if (session?.user?.id) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    const settings = await getUserSettings(session.user.id)
    setCurrency(settings?.currency || "USD")

    const data = await getTransactions(session.user.id)
    setTransactions(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    const result = await deleteTransaction(id)
    if (result.success) {
      await loadData()
    }
  }

  const filteredTransactions = transactions.filter((t) => {
    if (filter.type !== "all" && t.type !== filter.type) return false
    if (filter.category !== "all" && t.category !== filter.category) return false
    return true
  })

  const categories = Array.from(new Set(transactions.map((t) => t.category)))

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-muted-foreground">View and manage all your transactions</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={filter.type} onValueChange={(v) => setFilter({ ...filter, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={filter.category} onValueChange={(v) => setFilter({ ...filter, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              All Transactions ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found. Start by adding your first transaction!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
                            {transaction.type === "income" ? "💰 Income" : "💸 Expense"}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {transaction.description || "-"}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount, currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
