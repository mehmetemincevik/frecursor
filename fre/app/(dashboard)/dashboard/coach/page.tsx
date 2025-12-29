"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"

interface AIReport {
  highlights: string[]
  actions: Array<{
    action: string
    estimatedSavings: number
    priority: "high" | "medium" | "low"
  }>
  risks: string[]
  assumptions: string[]
}

export default function CoachPage() {
  const [report, setReport] = useState<AIReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/ai/report", {
        method: "POST",
      })
      const data = await response.json()
      if (data.success) {
        setReport(data.report)
      }
    } catch (error) {
      console.error("Failed to generate report:", error)
    } finally {
      setLoading(false)
    }
  }

  const askQuestion = async () => {
    if (!question.trim()) return

    setChatLoading(true)
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })
      const data = await response.json()
      if (data.success) {
        setAnswer(data.answer)
        setQuestion("")
      }
    } catch (error) {
      console.error("Failed to get answer:", error)
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Savings Coach</h1>
        <p className="text-gray-600">Get personalized savings advice and insights</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Savings Report</CardTitle>
          <CardDescription>
            Generate an AI-powered analysis of your spending with actionable recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateReport} disabled={loading} className="mb-4">
            {loading ? "Generating..." : "Generate Monthly Report"}
          </Button>

          {report && (
            <div className="space-y-6 mt-6">
              <div>
                <h3 className="font-semibold mb-2">Key Highlights</h3>
                <ul className="list-disc list-inside space-y-1">
                  {report.highlights.map((highlight, idx) => (
                    <li key={idx} className="text-gray-700">{highlight}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Actionable Recommendations</h3>
                <div className="space-y-3">
                  {report.actions.map((action, idx) => (
                    <div
                      key={idx}
                      className={`p-4 border rounded ${
                        action.priority === "high"
                          ? "border-red-200 bg-red-50"
                          : action.priority === "medium"
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="flex-1">{action.action}</p>
                        <span className="ml-4 font-semibold text-green-600">
                          Save: {formatCurrency(action.estimatedSavings, "TRY")}
                        </span>
                      </div>
                      <span
                        className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                          action.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : action.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {action.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {report.risks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-red-600">Risks</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {report.risks.map((risk, idx) => (
                      <li key={idx} className="text-red-700">{risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.assumptions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-gray-600">Assumptions</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {report.assumptions.map((assumption, idx) => (
                      <li key={idx}>{assumption}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ask the Coach</CardTitle>
          <CardDescription>
            Ask questions about your spending and get personalized advice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., How can I save 2000 TRY next month?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && askQuestion()}
              />
              <Button onClick={askQuestion} disabled={chatLoading || !question.trim()}>
                {chatLoading ? "Thinking..." : "Ask"}
              </Button>
            </div>

            {answer && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

