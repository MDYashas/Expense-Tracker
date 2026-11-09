"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  createRecurringBill,
  getRecurringBills,
  updateRecurringBill,
  deleteRecurringBill,
  markBillAsPaid,
  sendManualReminder,
  getUpcomingBills,
} from "@/app/actions/bills"
import { getCategories } from "@/app/actions/user"
import { getUserSettings } from "@/app/actions/auth"
import { formatCurrency, defaultCategories } from "@/lib/constants"
import { format, differenceInDays } from "date-fns"
import { 
  Bell, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Send, 
  AlertCircle,
  Clock,
  DollarSign,
  Repeat,
  Edit
} from "lucide-react"

interface RecurringBill {
  id: string
  name: string
  amount: number
  category: string
  description?: string | null
  frequency: string
  nextDueDate: Date
  reminderDays: number
  isActive: boolean
  lastPaidDate?: Date | null
}

export default function BillsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [bills, setBills] = useState<RecurringBill[]>([])
  const [upcomingBills, setUpcomingBills] = useState<RecurringBill[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [currency, setCurrency] = useState("USD")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    description: "",
    frequency: "monthly",
    nextDueDate: new Date().toISOString().split("T")[0],
    reminderDays: "3",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      loadData()
    }
  }, [session?.user?.id])

  const loadData = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const [billsData, upcomingData, categoriesData, settingsData] = await Promise.all([
        getRecurringBills(session.user.id, { isActive: true }),
        getUpcomingBills(session.user.id),
        getCategories(session.user.id),
        getUserSettings(session.user.id),
      ])

      setBills(billsData)
      setUpcomingBills(upcomingData)
      
      const expenseCategories = categoriesData.length > 0
        ? categoriesData.filter((c: any) => c.type === "expense")
        : defaultCategories.expense

      setCategories(expenseCategories)
      setCurrency(settingsData?.currency || "USD")
    } catch (err) {
      console.error("Error loading bills:", err)
      setError("Failed to load bills")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      category: "",
      description: "",
      frequency: "monthly",
      nextDueDate: new Date().toISOString().split("T")[0],
      reminderDays: "3",
    })
    setEditingBill(null)
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const billData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description || undefined,
        frequency: formData.frequency as "daily" | "weekly" | "monthly" | "yearly",
        nextDueDate: new Date(formData.nextDueDate),
        reminderDays: parseInt(formData.reminderDays),
      }

      let result
      if (editingBill) {
        result = await updateRecurringBill(editingBill.id, billData)
      } else {
        result = await createRecurringBill(billData)
      }

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(editingBill ? "Bill updated successfully!" : "Bill created successfully!")
        resetForm()
        setIsDialogOpen(false)
        await loadData()
      }
    } catch (error) {
      setError("Failed to save bill")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (bill: RecurringBill) => {
    setEditingBill(bill)
    setFormData({
      name: bill.name,
      amount: bill.amount.toString(),
      category: bill.category,
      description: bill.description || "",
      frequency: bill.frequency,
      nextDueDate: new Date(bill.nextDueDate).toISOString().split("T")[0],
      reminderDays: bill.reminderDays.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return

    const result = await deleteRecurringBill(id)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Bill deleted successfully!")
      await loadData()
    }
  }

  const handleMarkAsPaid = async (id: string) => {
    const result = await markBillAsPaid(id)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Bill marked as paid and next due date updated!")
      await loadData()
    }
  }

  const handleSendReminder = async (id: string) => {
    setLoading(true)
    const result = await sendManualReminder(id)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Reminder sent successfully!")
    }
    setLoading(false)
  }

  const getDaysUntilDue = (dueDate: Date) => {
    return differenceInDays(new Date(dueDate), new Date())
  }

  const getUrgencyBadge = (daysUntilDue: number) => {
    if (daysUntilDue < 0) {
      return <Badge variant="destructive">Overdue</Badge>
    } else if (daysUntilDue === 0) {
      return <Badge variant="destructive">Due Today</Badge>
    } else if (daysUntilDue <= 3) {
      return <Badge className="bg-orange-500">Due in {daysUntilDue}d</Badge>
    } else if (daysUntilDue <= 7) {
      return <Badge className="bg-yellow-500">Due in {daysUntilDue}d</Badge>
    } else {
      return <Badge variant="secondary">Due in {daysUntilDue}d</Badge>
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Recurring Bills & Reminders</h1>
              <p className="text-muted-foreground">Manage your recurring bills and never miss a payment</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Bill
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingBill ? "Edit Bill" : "Add New Recurring Bill"}</DialogTitle>
                  <DialogDescription>
                    Set up a recurring bill and receive email reminders before it's due
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  {error && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="name">Bill Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Netflix Subscription, Rent, Utilities"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat, idx) => (
                            <SelectItem key={`${cat.name}-${idx}`} value={cat.name}>
                              {cat.icon && `${cat.icon} `}{cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency *</Label>
                      <Select
                        value={formData.frequency}
                        onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nextDueDate">Next Due Date *</Label>
                      <Input
                        id="nextDueDate"
                        type="date"
                        value={formData.nextDueDate}
                        onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="reminderDays">Reminder (days before due) *</Label>
                      <Select
                        value={formData.reminderDays}
                        onValueChange={(value) => setFormData({ ...formData, reminderDays: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">On due date</SelectItem>
                          <SelectItem value="1">1 day before</SelectItem>
                          <SelectItem value="3">3 days before</SelectItem>
                          <SelectItem value="7">1 week before</SelectItem>
                          <SelectItem value="14">2 weeks before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="description">Notes (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Any additional notes about this bill..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? "Saving..." : editingBill ? "Update Bill" : "Create Bill"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false)
                        resetForm()
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {success && (
          <div className="mb-6 bg-green-500/15 text-green-600 text-sm p-3 rounded-md flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}

        {/* Upcoming Bills Alert */}
        {upcomingBills.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <AlertCircle className="h-5 w-5" />
                Upcoming Bills (Next 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingBills.map((bill) => {
                  const daysUntil = getDaysUntilDue(bill.nextDueDate)
                  return (
                    <div key={bill.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium">{bill.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(bill.nextDueDate), "MMM dd, yyyy")} • {formatCurrency(bill.amount, currency)}
                          </p>
                        </div>
                      </div>
                      {getUrgencyBadge(daysUntil)}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Recurring Bills ({bills.length})</CardTitle>
            <CardDescription>
              Manage your recurring bills and payment reminders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && bills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : bills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recurring bills set up yet.</p>
                <p className="text-sm mt-2">Click "Add Bill" to create your first bill reminder!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => {
                      const daysUntil = getDaysUntilDue(bill.nextDueDate)
                      return (
                        <TableRow key={bill.id}>
                          <TableCell className="font-medium">{bill.name}</TableCell>
                          <TableCell className="font-semibold text-primary">
                            {formatCurrency(bill.amount, currency)}
                          </TableCell>
                          <TableCell>{bill.category}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <Repeat className="h-3 w-3" />
                              {bill.frequency}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(bill.nextDueDate), "MMM dd, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>{getUrgencyBadge(daysUntil)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(bill)}
                                title="Edit bill"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsPaid(bill.id)}
                                title="Mark as paid"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendReminder(bill.id)}
                                title="Send reminder now"
                                disabled={loading}
                              >
                                <Send className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(bill.id)}
                                title="Delete bill"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  How Bill Reminders Work
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Email reminders are sent automatically based on your settings</li>
                  <li>• Mark bills as paid to update the next due date automatically</li>
                  <li>• Click the send icon to receive an immediate reminder email</li>
                  <li>• Reminders include bill details and payment information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
