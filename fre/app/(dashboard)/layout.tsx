import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { SignOutButton } from "@/components/sign-out-button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                SpendSense
              </Link>
              <div className="flex gap-4">
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/dashboard/transactions" className="text-gray-700 hover:text-blue-600">
                  Transactions
                </Link>
                <Link href="/dashboard/upload" className="text-gray-700 hover:text-blue-600">
                  Upload CSV
                </Link>
                <Link href="/dashboard/budgets" className="text-gray-700 hover:text-blue-600">
                  Budgets
                </Link>
                <Link href="/dashboard/insights" className="text-gray-700 hover:text-blue-600">
                  Insights
                </Link>
                <Link href="/dashboard/coach" className="text-gray-700 hover:text-blue-600">
                  AI Coach
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user?.email}</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

