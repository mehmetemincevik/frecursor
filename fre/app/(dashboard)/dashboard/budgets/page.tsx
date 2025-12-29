"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"

interface Category {
  id: string
  name: string
}

interface Budget {
  id: string
  category: { name: string }
  amount: number
  spent: number
  month: number
  year: number
}

export default function BudgetsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [budgetAmount, setBudgetAmount] = useState("")
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadData()
  }, [month, year])

  const loadData = async () => {
    setLoading(true)
    try {
      const [categoriesRes, budgetsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch(`/api/budgets?month=${month}&year=${year}`),
      ])

      const categoriesData = await categoriesRes.json()
      const budgetsData = await budgetsRes.json()

      setCategories(categoriesData.categories || [])
      setBudgets(budgetsData.budgets || [])
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBudget = async () => {
    if (!selectedCategory || !budgetAmount) {
      return
    }

    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory,
          amount: parseFloat(budgetAmount),
          month,
          year,
        }),
      })

      if (response.ok) {
        setSelectedCategory("")
        setBudgetAmount("")
        loadData()
      }
    } catch (error) {
      console.error("Failed to create budget:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Budgets</h1>
        <p className="text-gray-600">Set and track monthly budgets by category</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Set Budget</CardTitle>
          <CardDescription>Create a monthly budget for a category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Month</Label>
              <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {new Date(2000, m - 1).toLocaleDateString("en-US", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleCreateBudget} className="mt-4">
            Create Budget
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Budgets</CardTitle>
          <CardDescription>
            {new Date(year, month - 1).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <p className="text-gray-500">No budgets set for this month</p>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const percentage = (budget.spent / budget.amount) * 100
                const isOver = budget.spent > budget.amount
                const isWarning = percentage >= 90

                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{budget.category.name}</span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(budget.spent, "TRY")} /{" "}
                        {formatCurrency(budget.amount, "TRY")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          isOver
                            ? "bg-red-600"
                            : isWarning
                            ? "bg-yellow-500"
                            : "bg-green-600"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    {isOver && (
                      <p className="text-sm text-red-600">
                        Over budget by {formatCurrency(budget.spent - budget.amount, "TRY")}
                      </p>
                    )}
                    {isWarning && !isOver && (
                      <p className="text-sm text-yellow-600">
                        Warning: {percentage.toFixed(1)}% of budget used
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

