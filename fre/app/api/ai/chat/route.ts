import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { chatWithCoach } from "@/lib/ai-coach"
import { getMonthYear } from "@/lib/utils"

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { question } = body

    if (!question) {
      return NextResponse.json({ error: "Question required" }, { status: 400 })
    }

    const { month, year } = getMonthYear()
    const answer = await chatWithCoach(user.id, question, month, year)

    return NextResponse.json({ success: true, answer })
  } catch (error) {
    console.error("AI chat error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 }
    )
  }
}

