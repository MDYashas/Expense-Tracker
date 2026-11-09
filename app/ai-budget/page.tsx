"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getAIBudgetSuggestions } from "@/app/actions/ai-budget"
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, CheckCircle2, Info, Sparkles } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface BudgetSuggestion {
  success: boolean
  error?: string
  monthly_income: number
  current_spending: number
  recommended_budgets: {
    essentials: number
    lifestyle: number
    savings: number
  }
  category_budgets: {
    [key: string]: {
      current_spending: number
      suggested_budget: number
      difference: number
      category_type: string
    }
  }
  spending_analysis: {
    trend: string
    variance: number
    total_transactions: number
  }
  ai_insights: Array<{
    type: string
    title: string
    message: string
  }>
  confidence_score: number
}

export default function AIBudgetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [budgetData, setBudgetData] = useState<BudgetSuggestion | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBudgetSuggestions()
  }, [])

  const loadBudgetSuggestions = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getAIBudgetSuggestions()
      
      if (result.success) {
        setBudgetData(result as BudgetSuggestion)
      } else {
        // If less than 5 transactions, redirect to dashboard
        if (result.error?.includes("at least 5 transactions")) {
          router.push("/dashboard")
          return
        }
        setError(result.error || "Failed to generate suggestions")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "success": return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "tip": return <Lightbulb className="h-5 w-5 text-yellow-500" />
      case "info": return <Info className="h-5 w-5 text-blue-500" />
      default: return <Info className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Analyzing your spending patterns...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={loadBudgetSuggestions} variant="outline">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!budgetData) {
    return null
  }

  const spendingRate = (budgetData.current_spending / budgetData.monthly_income) * 100
  const savingsRate = 100 - spendingRate

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            AI Budget Advisor
          </h1>
          <p className="text-muted-foreground mt-1">
            Powered by Gradient Boosting Machine Learning
          </p>
        </div>
        <Button onClick={loadBudgetSuggestions} variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* Confidence Score */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Confidence</CardTitle>
          <CardDescription>
            Based on {budgetData.spending_analysis.total_transactions} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Confidence Score</span>
              <span className="font-medium">{budgetData.confidence_score.toFixed(1)}%</span>
            </div>
            <Progress value={budgetData.confidence_score} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {budgetData.confidence_score < 50 
                ? "Add more transactions for better accuracy"
                : budgetData.confidence_score < 80
                ? "Good confidence level"
                : "High confidence in recommendations"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${budgetData.monthly_income.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${budgetData.current_spending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {spendingRate.toFixed(1)}% of income
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{savingsRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${(budgetData.monthly_income - budgetData.current_spending).toLocaleString()} remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Budget Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Budget (50/30/20 Rule)</CardTitle>
          <CardDescription>
            AI-adjusted allocation based on your spending patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Essentials (50%)</span>
                <span className="text-sm">${budgetData.recommended_budgets.essentials.toLocaleString()}</span>
              </div>
              <Progress 
                value={(budgetData.recommended_budgets.essentials / budgetData.monthly_income) * 100} 
                className="h-2 bg-blue-100" 
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Lifestyle (30%)</span>
                <span className="text-sm">${budgetData.recommended_budgets.lifestyle.toLocaleString()}</span>
              </div>
              <Progress 
                value={(budgetData.recommended_budgets.lifestyle / budgetData.monthly_income) * 100} 
                className="h-2 bg-purple-100" 
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Savings (20%)</span>
                <span className="text-sm">${budgetData.recommended_budgets.savings.toLocaleString()}</span>
              </div>
              <Progress 
                value={(budgetData.recommended_budgets.savings / budgetData.monthly_income) * 100} 
                className="h-2 bg-green-100" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {budgetData.ai_insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {budgetData.ai_insights.map((insight, index) => (
              <Alert key={index}>
                <div className="flex gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{insight.title}</h4>
                    <AlertDescription>{insight.message}</AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Category-wise Budgets */}
      <Card>
        <CardHeader>
          <CardTitle>Category-wise Budget Suggestions</CardTitle>
          <CardDescription>
            Spending trend: {budgetData.spending_analysis.trend}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(budgetData.category_budgets).map(([category, data]) => (
              <div key={category} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{category}</h4>
                    <Badge variant={data.category_type === 'essential' ? 'default' : 'secondary'}>
                      {data.category_type}
                    </Badge>
                  </div>
                  {data.difference < 0 ? (
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-medium">${data.current_spending.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Suggested</p>
                    <p className="font-medium">${data.suggested_budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Impact</p>
                    <p className={`font-medium ${data.difference < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {data.difference > 0 ? '+' : ''}${data.difference.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </div>
      </main>
    </div>
  )
}
