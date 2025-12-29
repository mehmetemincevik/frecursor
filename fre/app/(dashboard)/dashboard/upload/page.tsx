"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState({
    date: "",
    description: "",
    amount: "",
    type: "",
  })
  const [currency, setCurrency] = useState("TRY")
  const [dateFormat, setDateFormat] = useState("iso")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/transactions/preview", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setHeaders(data.headers || [])
        setPreview(data.rows || [])
      } else {
        setError(data.error || "Failed to preview file")
      }
    } catch (err) {
      setError("Failed to preview file")
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file")
      return
    }

    if (!mapping.date || !mapping.description || !mapping.amount) {
      setError("Please map all required columns (Date, Description, Amount)")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("dateColumn", mapping.date)
      formData.append("descriptionColumn", mapping.description)
      formData.append("amountColumn", mapping.amount)
      if (mapping.type) formData.append("typeColumn", mapping.type)
      formData.append("currency", currency)
      formData.append("dateFormat", dateFormat)

      const response = await fetch("/api/transactions/import", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(
          `Successfully imported ${data.imported} transactions. ${data.skipped} duplicates skipped.`
        )
        setTimeout(() => {
          router.push("/dashboard/transactions")
        }, 2000)
      } else {
        setError(data.error || "Import failed")
      }
    } catch (err) {
      setError("Import failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload CSV</h1>
        <p className="text-gray-600">Import your bank transactions from a CSV file</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step 1: Select File</CardTitle>
          <CardDescription>Choose your bank transaction CSV file</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {preview.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Map Columns</CardTitle>
              <CardDescription>
                Map your CSV columns to transaction fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date Column *</Label>
                    <Select
                      value={mapping.date}
                      onValueChange={(value) =>
                        setMapping({ ...mapping, date: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((header, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            {header} (Column {idx + 1})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Description Column *</Label>
                    <Select
                      value={mapping.description}
                      onValueChange={(value) =>
                        setMapping({ ...mapping, description: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((header, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            {header} (Column {idx + 1})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Amount Column *</Label>
                    <Select
                      value={mapping.amount}
                      onValueChange={(value) =>
                        setMapping({ ...mapping, amount: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((header, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            {header} (Column {idx + 1})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Type Column (Optional)</Label>
                    <Select
                      value={mapping.type}
                      onValueChange={(value) =>
                        setMapping({ ...mapping, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {headers.map((header, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            {header} (Column {idx + 1})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRY">TRY</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Date Format</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iso">ISO (YYYY-MM-DD)</SelectItem>
                        <SelectItem value="dd.mm.yyyy">DD.MM.YYYY</SelectItem>
                        <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 3: Preview</CardTitle>
              <CardDescription>First 20 rows of your CSV</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {headers.map((header, idx) => (
                        <th key={idx} className="text-left p-2">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 20).map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b">
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="p-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 4: Import</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded">
                  {success}
                </div>
              )}
              <Button onClick={handleImport} disabled={loading} className="w-full">
                {loading ? "Importing..." : "Import Transactions"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

