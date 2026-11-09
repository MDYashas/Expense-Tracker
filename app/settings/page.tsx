"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { getUserSettings } from "@/app/actions/auth"
import { updateSettings, getCategories, createCategory, deleteCategory } from "@/app/actions/user"
import { currencies } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense" as "income" | "expense",
  })
  const [settings, setSettings] = useState({
    currency: "USD",
    theme: "light" as "light" | "dark",
  })

  useEffect(() => {
    if (session?.user?.id) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    if (!session?.user?.id) return
    
    const userSettings = await getUserSettings(session.user.id)
    if (userSettings) {
      setSettings({
        currency: userSettings.currency,
        theme: userSettings.theme as "light" | "dark",
      })
    }

    const userCategories = await getCategories(session.user.id)
    setCategories(userCategories)
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const result = await updateSettings(settings)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      setError("Failed to update settings")
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name) return

    const result = await createCategory(newCategory)
    if (result.success) {
      setNewCategory({ name: "", type: "expense" })
      await loadData()
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    const result = await deleteCategory(id)
    if (result.success) {
      await loadData()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your app preferences and categories</p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-500/15 text-green-600 text-sm p-3 rounded-md">
                  Settings updated successfully!
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) => setSettings({ ...settings, currency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle dark mode for the app
                  </p>
                </div>
                <Switch
                  id="theme"
                  checked={settings.theme === "dark"}
                  onCheckedChange={(checked) => setSettings({ ...settings, theme: checked ? "dark" : "light" })}
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={loading}>
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* Custom Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Categories</CardTitle>
              <CardDescription>Add your own income and expense categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Category */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                  <Select
                    value={newCategory.type}
                    onValueChange={(value: "income" | "expense") => setNewCategory({ ...newCategory, type: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddCategory}>Add</Button>
                </div>
              </div>

              {/* Existing Categories */}
              <div className="space-y-2">
                <Label>Your Custom Categories</Label>
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No custom categories yet. Add one above!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Badge key={cat.id} variant="outline" className="flex items-center gap-2">
                        {cat.name}
                        <span className="text-xs text-muted-foreground">
                          ({cat.type})
                        </span>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
