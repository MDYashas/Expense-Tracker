"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createTransaction } from "@/app/actions/transactions"
import { getCategories } from "@/app/actions/user"
import { defaultCategories } from "@/lib/constants"
import { Upload, Camera, Loader2, CheckCircle2, X } from "lucide-react"
import Image from "next/image"

export default function AddTransactionPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [type, setType] = useState<"income" | "expense">("expense")
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })
  
  // Receipt OCR states
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrSuccess, setOcrSuccess] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      loadCategories()
    }
  }, [session, type])

  const loadCategories = async () => {
    if (!session?.user?.id) return
    
    const userCategories = await getCategories(session.user.id)
    const filteredUserCategories = userCategories.filter((cat) => cat.type === type)
    const defaultCats = defaultCategories[type]
    
    setCategories([...filteredUserCategories, ...defaultCats])
  }

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB")
      return
    }

    setReceiptFile(file)
    setOcrSuccess(false)
    setError("")

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const processReceipt = async () => {
    if (!receiptFile) return

    setOcrLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append('receipt', receiptFile)

      const response = await fetch('http://localhost:5000/process-receipt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process receipt')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Auto-fill form with extracted data
        setFormData(prev => ({
          ...prev,
          amount: result.data.amount?.toString() || prev.amount,
          category: result.data.category || prev.category,
          description: result.data.description || prev.description,
        }))
        setOcrSuccess(true)
        
        // Show success message briefly
        setTimeout(() => setOcrSuccess(false), 3000)
      }
    } catch (err: any) {
      setError(err.message || "Failed to process receipt. Make sure the Python OCR service is running.")
    } finally {
      setOcrLoading(false)
    }
  }

  const clearReceipt = () => {
    setReceiptFile(null)
    setReceiptPreview(null)
    setOcrSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const result = await createTransaction({
        type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date),
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setFormData({
          amount: "",
          category: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
        })
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      }
    } catch (error) {
      setError("Failed to create transaction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add Transaction</h1>
          <p className="text-muted-foreground">Record a new income or expense transaction</p>
        </div>

        {/* Receipt Scanner Card */}
        <Card className="mb-6 border-2 border-dashed border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Receipt Scanner (Beta)
            </CardTitle>
            <CardDescription>
              Upload a receipt photo to automatically extract transaction details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!receiptPreview ? (
              <div className="flex flex-col items-center justify-center py-8">
                <input
                  type="file"
                  id="receipt-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                />
                <label
                  htmlFor="receipt-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="rounded-full bg-primary/10 p-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Click to upload receipt</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG up to 10MB</span>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border">
                  <Image
                    src={receiptPreview}
                    alt="Receipt preview"
                    width={400}
                    height={300}
                    className="w-full h-auto max-h-64 object-contain bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={clearReceipt}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {ocrSuccess && (
                  <div className="bg-green-500/15 text-green-600 text-sm p-3 rounded-md flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Receipt processed! Form auto-filled below.
                  </div>
                )}
                
                <Button
                  type="button"
                  onClick={processReceipt}
                  disabled={ocrLoading}
                  className="w-full"
                >
                  {ocrLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Receipt...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Scan Receipt
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Fill in the details manually or use receipt scanner above</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="income">Income 💰</TabsTrigger>
                <TabsTrigger value="expense">Expense 💸</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-500/15 text-green-600 text-sm p-3 rounded-md">
                    Transaction created successfully! Redirecting...
                  </div>
                )}

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
                      <SelectValue placeholder="Select a category" />
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
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add a note about this transaction..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Creating..." : `Add ${type === "income" ? "Income" : "Expense"}`}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
