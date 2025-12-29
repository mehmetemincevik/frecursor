import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getMonthYear, formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardCharts } from "@/components/dashboard-charts"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  const { month, year } = getMonthYear()
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  // Get transactions for current month
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: startDate, lte: endDate },
    },
    include: {
      category: true,
    },
  })

  const income = transactions
    .filter(tx => tx.direction === "income")
    .reduce((sum, tx) => sum + tx.amount, 0)

  const expense = Math.abs(
    transactions
      .filter(tx => tx.direction === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0)
  )

  const net = income - expense
  const savingsRate = income > 0 ? ((net / income) * 100) : 0

  // Category breakdown
  const categoryTotals = new Map<string, number>()
  for (const tx of transactions.filter(tx => tx.direction === "expense" && tx.category)) {
    const catName = tx.category!.name
    categoryTotals.set(catName, (categoryTotals.get(catName) || 0) + Math.abs(tx.amount))
  }

  const topCategories = Array.from(categoryTotals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  // Get last 6 months for trend
  const trendData = []
  for (let i = 5; i >= 0; i--) {
    const trendMonth = month - i
    const trendYear = trendMonth <= 0 ? year - 1 : year
    const adjustedMonth = trendMonth <= 0 ? trendMonth + 12 : trendMonth

    const trendStart = new Date(trendYear, adjustedMonth - 1, 1)
    const trendEnd = new Date(trendYear, adjustedMonth, 0, 23, 59, 59)

    const trendTxs = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: trendStart, lte: trendEnd },
        direction: "expense",
      },
    })

    const trendExpense = Math.abs(
      trendTxs.reduce((sum, tx) => sum + tx.amount, 0)
    )

    trendData.push({
      month: adjustedMonth,
      year: trendYear,
      expense: trendExpense,
      label: `${adjustedMonth}/${trendYear}`,
    })
  }

  const currency = transactions[0]?.currency || "TRY"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          {new Date(year, month - 1).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(income, currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(expense, currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(net, currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Savings Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${savingsRate >= 0 ? "text-green-600" : "text-red-600"}`}>
              {savingsRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts
        topCategories={topCategories}
        trendData={trendData}
        currency={currency}
      />
    </div>
  )
}

