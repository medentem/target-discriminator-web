"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { SessionConfig } from "@/lib/models/session-config"
import { isValidSessionConfig } from "@/lib/models/session-config"
import Link from "next/link"

export default function SessionConfigPage() {
  const router = useRouter()
  const [includeVideos, setIncludeVideos] = useState(true)
  const [includePhotos, setIncludePhotos] = useState(true)
  const [durationMinutes, setDurationMinutes] = useState(1)

  const config: SessionConfig = {
    includeVideos,
    includePhotos,
    durationMinutes,
  }

  const canStart = isValidSessionConfig(config)

  const handleStartSession = () => {
    if (!canStart) return

    const params = new URLSearchParams({
      videos: includeVideos.toString(),
      photos: includePhotos.toString(),
      duration: durationMinutes.toString(),
    })

    router.push(`/training?${params.toString()}`)
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Session Configuration</CardTitle>
          <CardDescription>
            Configure your training session settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Include Videos</label>
                <p className="text-sm text-muted-foreground">
                  Show video clips during training
                </p>
              </div>
              <Switch
                checked={includeVideos}
                onCheckedChange={setIncludeVideos}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Include Photos</label>
                <p className="text-sm text-muted-foreground">
                  Show photos during training
                </p>
              </div>
              <Switch
                checked={includePhotos}
                onCheckedChange={setIncludePhotos}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Duration</label>
                <span className="text-sm text-muted-foreground">
                  {durationMinutes} {durationMinutes === 1 ? "minute" : "minutes"}
                </span>
              </div>
              <Slider
                value={[durationMinutes]}
                onValueChange={(value) => setDurationMinutes(value[0])}
                min={1}
                max={30}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {!canStart && (
            <p className="text-sm text-destructive">
              Please enable at least one media type to start a session.
            </p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleStartSession}
              disabled={!canStart}
              className="flex-1"
            >
              Start Training Session
            </Button>
            <Button variant="outline" asChild>
              <Link href="/media-management">Manage Media</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

