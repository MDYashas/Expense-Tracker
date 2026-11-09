"use client"

import { useRouter } from "next/navigation"
import Hero from "@/app/newpage"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Home() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/register")
  }

  const handleExploreFeatures = () => {
    const featuresSection = document.getElementById("features")
    featuresSection?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Bar - Fixed at top with curved bottom */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 rounded-b-[2rem] mx-4 mt-2 shadow-2xl shadow-orange-500/10">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl">💰</span>
                <span className="text-xl font-bold text-white">ExpenseTracker</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-semibold">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Animated Shader Background */}
      <Hero
        trustBadge={{
          text: "Trusted by thousands of users worldwide",
          icons: ["💰", "✨", "🚀"]
        }}
        headline={{
          line1: "Master Your Money,",
          line2: "Amplify Your Wealth"
        }}
        subtitle="Track expenses effortlessly, scan receipts with AI, and never miss a bill. Make informed financial decisions with powerful analytics and smart automation."
        buttons={{
          primary: {
            text: "Start Tracking Free",
            onClick: handleGetStarted
          },
          secondary: {
            text: "Explore Features",
            onClick: handleExploreFeatures
          }
        }}
      />
      
      {/* Features Section */}
      <section id="features" className="bg-white dark:bg-slate-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Powerful Features for Smart Money Management
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Everything you need to track, analyze, and optimize your finances in one place
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-semibold mb-2">Receipt Scanner (NEW!)</h3>
              <p className="text-muted-foreground">
                Upload receipt photos and let AI extract amounts, merchants, and categories automatically. Save time with OCR technology.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold mb-2">Bill Reminders</h3>
              <p className="text-muted-foreground">
                Never miss a payment again. Get email reminders for recurring bills with customizable notification schedules.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Visual Analytics</h3>
              <p className="text-muted-foreground">
                Beautiful charts and graphs to understand spending patterns. Monthly trends, category breakdowns, and more.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">Transaction Tracking</h3>
              <p className="text-muted-foreground">
                Track all income and expenses with detailed categorization, filters, and search. Export your data anytime.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Budget Goals</h3>
              <p className="text-muted-foreground">
                Set monthly budgets and track progress in real-time. Get alerts when approaching spending limits.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-muted-foreground">
                Smart categorization using AI. Get personalized recommendations to optimize your spending habits.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Multi-Currency Support</h3>
              <p className="text-muted-foreground">
                Track expenses in USD, EUR, GBP, INR, JPY, and more. Perfect for international transactions.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Bank-level encryption with NextAuth. Your data is secure and never shared with third parties.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Built with Next.js 16 and React 19. Add transactions instantly and access insights in milliseconds.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Get Started in 3 Simple Steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up Free</h3>
              <p className="text-muted-foreground">
                Create your account in seconds. No credit card required.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Transactions</h3>
              <p className="text-muted-foreground">
                Manually enter or scan receipts to track your expenses effortlessly.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyze & Save</h3>
              <p className="text-muted-foreground">
                View insights, set budgets, and make smarter financial decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-12 border border-primary/20">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                10K+
              </div>
              <div className="text-muted-foreground font-medium">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                1M+
              </div>
              <div className="text-muted-foreground font-medium">Transactions Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                99%
              </div>
              <div className="text-muted-foreground font-medium">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-yellow-500 text-xl">⭐⭐⭐⭐⭐</div>
              </div>
              <p className="text-muted-foreground mb-4">
                "The receipt scanner is a game-changer! I just snap a photo and it fills everything automatically. Saves me so much time!"
              </p>
              <div className="font-semibold">- Sarah M.</div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-yellow-500 text-xl">⭐⭐⭐⭐⭐</div>
              </div>
              <p className="text-muted-foreground mb-4">
                "Bill reminders have saved me from late fees multiple times. The email notifications are perfect and always on time."
              </p>
              <div className="font-semibold">- James T.</div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-yellow-500 text-xl">⭐⭐⭐⭐⭐</div>
              </div>
              <p className="text-muted-foreground mb-4">
                "Best expense tracker I've used. The analytics are beautiful and actually help me understand my spending patterns."
              </p>
              <div className="font-semibold">- Emily R.</div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready to Transform Your Financial Life?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands who are already managing their money smarter. Start tracking expenses, scanning receipts, and never miss a bill again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Get Started Free →
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm opacity-75">No credit card required • Free forever • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">💰</span>
                <span className="text-xl font-bold">ExpenseTracker</span>
              </div>
              <p className="text-white/70 text-sm">
                Your personal finance companion for smarter money management.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/register" className="hover:text-white">Features</Link></li>
                <li><Link href="/register" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/register" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/register" className="hover:text-white">About</Link></li>
                <li><Link href="/register" className="hover:text-white">Blog</Link></li>
                <li><Link href="/register" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/register" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/register" className="hover:text-white">Terms</Link></li>
                <li><Link href="/register" className="hover:text-white">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-white/70 text-sm">
            <p>© 2025 ExpenseTracker. All rights reserved. Built with ❤️ using Next.js</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
