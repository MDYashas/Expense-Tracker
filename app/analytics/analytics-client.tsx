"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/constants"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d", "#ffc658", "#ff7c7c"]

interface AnalyticsClientProps {
  transactions: any[]
  currency: string
}

export function AnalyticsClient({ transactions, currency }: AnalyticsClientProps) {
  // Group expenses by category
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc: any, t: any) => {
      if (!acc[t.category]) {
        acc[t.category] = 0
      }
      acc[t.category] += t.amount
      return acc
    }, {})

  const expensePieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }))

  // Group income by category
  const incomeByCategory = transactions
    .filter((t) => t.type === "income")
    .reduce((acc: any, t: any) => {
      if (!acc[t.category]) {
        acc[t.category] = 0
      }
      acc[t.category] += t.amount
      return acc
    }, {})

  const incomePieData = Object.entries(incomeByCategory).map(([name, value]) => ({
    name,
    value,
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(payload[0].value, currency)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      {/* Pie Charts */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {expensePieData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No expense data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Income by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Income by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {incomePieData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No income data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {expensePieData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No expense data available
              </div>
            ) : (
              <div className="space-y-4">
                {expensePieData
                  .sort((a, b) => (b.value as number) - (a.value as number))
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {formatCurrency(item.value as number, currency)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Income Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {incomePieData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No income data available
              </div>
            ) : (
              <div className="space-y-4">
                {incomePieData
                  .sort((a, b) => (b.value as number) - (a.value as number))
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {formatCurrency(item.value as number, currency)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
