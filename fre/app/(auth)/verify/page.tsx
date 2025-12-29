import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We've sent you a magic link to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Click the link in the email to sign in. The link will expire in 24 hours.
          </p>
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            Back to home
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

