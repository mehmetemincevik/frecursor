import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getMonthYear } from "@/lib/utils"
import { detectSubscriptions, detectAnomalies, findTopLeaks } from "@/lib/insights"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function InsightsPage() {
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

  const [subscriptions, anomalies, topLeaks] = await Promise.all([
    detectSubscriptions(user.id, 6),
    detectAnomalies(user.id, month, year),
    findTopLeaks(user.id, month, year),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Insights</h1>
        <p className="text-gray-600">Discover patterns and anomalies in your spending</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscriptions Detected</CardTitle>
          <CardDescription>
            Recurring monthly charges identified from your transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <p className="text-gray-500">No subscriptions detected</p>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <p className="font-semibold">{sub.merchant}</p>
                    <p className="text-sm text-gray-600">
                      {sub.frequency} • {sub.count} occurrences
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {formatCurrency(sub.amount, "TRY")}
                    </p>
                    <p className="text-sm text-gray-600">
                      Last: {new Date(sub.lastDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anomalies</CardTitle>
          <CardDescription>
            Unusual spending patterns detected this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <p className="text-gray-500">No anomalies detected</p>
          ) : (
            <div className="space-y-4">
              {anomalies.map((anomaly) => (
                <div key={anomaly.transactionId} className="p-4 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        {anomaly.merchant || anomaly.category || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-600">{anomaly.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg text-red-600">
                        {formatCurrency(anomaly.amount, "TRY")}
                      </p>
                      <p className="text-sm text-gray-600">
                        Baseline: {formatCurrency(anomaly.baseline, "TRY")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Spending Leaks</CardTitle>
          <CardDescription>
            Categories with largest month-over-month increases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topLeaks.length === 0 ? (
            <p className="text-gray-500">No significant increases detected</p>
          ) : (
            <div className="space-y-4">
              {topLeaks.map((leak, idx) => (
                <div key={idx} className="p-4 border rounded">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-lg">{leak.category}</p>
                    <p className="text-red-600 font-semibold">
                      +{leak.increasePercent.toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      Previous: {formatCurrency(leak.previousMonth, "TRY")}
                    </span>
                    <span>
                      Current: {formatCurrency(leak.currentMonth, "TRY")}
                    </span>
                    <span>
                      Increase: {formatCurrency(leak.increase, "TRY")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

