"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

interface MonthlyChartProps {
  data: Array<{
    month: number
    income: number
    expense: number
  }>
  currency: string
}

export function MonthlyChart({ data, currency }: MonthlyChartProps) {
  const chartData = data.map((item) => ({
    name: monthNames[item.month - 1],
    Income: item.income,
    Expenses: item.expense,
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="name" 
          className="text-sm"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis 
          className="text-sm"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        <Legend />
        <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
