"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAgeVerification } from "@/lib/hooks/use-age-verification"
import Link from "next/link"

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

function calculateAge(birthMonth: number | null, birthYear: number | null): number | null {
  if (birthMonth === null || birthYear === null) {
    return null
  }

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1 // JavaScript months are 0-indexed

  let age = currentYear - birthYear

  // If birthday hasn't occurred this year yet (current month is before birth month), subtract 1
  if (currentMonth < birthMonth) {
    age--
  }

  return age
}

export default function AgeVerificationPage() {
  const router = useRouter()
  const { setAgeVerified } = useAgeVerification()
  const [birthMonth, setBirthMonth] = useState<number | null>(null)
  const [birthYear, setBirthYear] = useState<number | null>(null)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  const age = useMemo(() => calculateAge(birthMonth, birthYear), [birthMonth, birthYear])
  const isAgeValid = age !== null && age >= 18

  const handleConfirm = () => {
    if (!isAgeValid) return
    setAgeVerified(true)
    router.push("/session-config")
  }

  const handleExit = () => {
    if (typeof window !== "undefined") {
      window.close()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Age Verification</CardTitle>
          <CardDescription>
            This application is designed for law enforcement, military, and private citizens
            to train threat identification skills. You must be 18 years or older to use this
            application. THE CONTENT IS GRAPHIC AND MAY BE DISTURBING TO SOME USERS.
            <br />
            <Link href="/privacy" className="text-primary underline hover:no-underline text-xs mt-2 inline-block">
              View Privacy Policy
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Birth Month</label>
              <select
                value={birthMonth || ""}
                onChange={(e) => setBirthMonth(e.target.value ? parseInt(e.target.value, 10) : null)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select month</option>
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Birth Year</label>
              <select
                value={birthYear || ""}
                onChange={(e) => setBirthYear(e.target.value ? parseInt(e.target.value, 10) : null)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Always render to reserve space, but only show when age is calculated to prevent CLS */}
            <div className={`rounded-md bg-muted p-3 text-sm min-h-[3rem] ${age === null ? 'invisible' : ''}`}>
              {age !== null && (
                <>
                  <p className="font-medium">
                    Age: {age} {age === 1 ? "year" : "years"}
                  </p>
                  {age < 18 && (
                    <p className="mt-1 text-destructive">
                      You must be 18 years or older to use this application.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConfirm} disabled={!isAgeValid} className="flex-1">
              I am 18 or older
            </Button>
            <Button onClick={handleExit} variant="outline" className="flex-1">
              Exit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

