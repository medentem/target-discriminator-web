"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AgeVerificationPage() {
  const router = useRouter()
  const [isConfirmed, setIsConfirmed] = useState(false)

  const handleConfirm = () => {
    setIsConfirmed(true)
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
            application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              By continuing, you confirm that you are at least 18 years of age and understand
              that this application contains training materials for threat identification.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleConfirm} className="flex-1">
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

