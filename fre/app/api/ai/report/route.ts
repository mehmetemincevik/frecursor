import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateMonthlyReport } from "@/lib/ai-coach"
import { getMonthYear } from "@/lib/utils"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { month, year } = getMonthYear()
    const report = await generateMonthlyReport(user.id, month, year)

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("AI report error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Report generation failed" },
      { status: 500 }
    )
  }
}

