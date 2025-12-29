import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TransactionsTable } from "@/components/transactions-table"

export default async function TransactionsPage() {
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

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-gray-600">View and manage your transactions</p>
      </div>
      <TransactionsTable categories={categories} />
    </div>
  )
}

