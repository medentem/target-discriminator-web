"use client"

import { useState, useMemo, useCallback, startTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { SessionConfig } from "@/lib/models/session-config"
import { isValidSessionConfig } from "@/lib/models/session-config"
import { AgeVerificationGuard } from "@/components/age-verification-guard"
import { useAndroidDetection } from "@/lib/hooks/use-android-detection"
import { ThreatLabelPreset, ThreatLabelConfig } from "@/lib/models/types"
import { LocalStorageService } from "@/lib/storage/local-storage"
import Link from "next/link"

function SessionConfigPageContent() {
  const router = useRouter()
  const isAndroid = useAndroidDetection()
  const [includeVideos, setIncludeVideos] = useState(true)
  const [includePhotos, setIncludePhotos] = useState(true)
  const [durationMinutes, setDurationMinutes] = useState(1)
  
  // Threat label configuration
  const [labelPreset, setLabelPreset] = useState<ThreatLabelPreset>("THREAT_NON_THREAT")
  const [customThreatLabel, setCustomThreatLabel] = useState("")
  const [customNonThreatLabel, setCustomNonThreatLabel] = useState("")

  // Load saved threat label config on mount
  useEffect(() => {
    const savedConfig = LocalStorageService.getThreatLabelConfig()
    setLabelPreset(savedConfig.preset)
    setCustomThreatLabel(savedConfig.customThreatLabel || "")
    setCustomNonThreatLabel(savedConfig.customNonThreatLabel || "")
  }, [])

  // Save threat label config when it changes
  useEffect(() => {
    const config: ThreatLabelConfig = {
      preset: labelPreset,
      ...(labelPreset === "CUSTOM" && {
        customThreatLabel: customThreatLabel.trim() || undefined,
        customNonThreatLabel: customNonThreatLabel.trim() || undefined,
      }),
    }
    LocalStorageService.saveThreatLabelConfig(config)
  }, [labelPreset, customThreatLabel, customNonThreatLabel])

  // Memoize config to avoid recreating object on every render
  const config: SessionConfig = useMemo(
    () => ({
      includeVideos,
      includePhotos,
      durationMinutes,
    }),
    [includeVideos, includePhotos, durationMinutes]
  )

  // Memoize validation result to avoid recalculating on every render
  const canStart = useMemo(() => isValidSessionConfig(config), [config])

  // Memoize duration display string
  const durationDisplay = useMemo(
    () => `${durationMinutes} ${durationMinutes === 1 ? "minute" : "minutes"}`,
    [durationMinutes]
  )

  const handleStartSession = useCallback(() => {
    if (!canStart) return

    const params = new URLSearchParams({
      videos: includeVideos.toString(),
      photos: includePhotos.toString(),
      duration: durationMinutes.toString(),
    })

    router.push(`/training?${params.toString()}`)
  }, [canStart, includeVideos, includePhotos, durationMinutes, router])

  // Optimize slider updates - keep immediate for smooth dragging, but memoize handler
  const handleDurationChange = useCallback((value: number[]) => {
    setDurationMinutes(value[0])
  }, [])

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4 space-y-4">
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
                  {durationDisplay}
                </span>
              </div>
              <Slider
                value={[durationMinutes]}
                onValueChange={handleDurationChange}
                min={1}
                max={30}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Threat Labels</label>
                <p className="text-sm text-muted-foreground">
                  Choose how threat and non-threat are labeled throughout the app
                </p>
              </div>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent">
                  <input
                    type="radio"
                    name="threatLabelPreset"
                    value="THREAT_NON_THREAT"
                    checked={labelPreset === "THREAT_NON_THREAT"}
                    onChange={(e) => setLabelPreset(e.target.value as ThreatLabelPreset)}
                    className="h-4 w-4"
                  />
                  <span className="font-medium">Threat / Non-Threat</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent">
                  <input
                    type="radio"
                    name="threatLabelPreset"
                    value="SHOOT_NO_SHOOT"
                    checked={labelPreset === "SHOOT_NO_SHOOT"}
                    onChange={(e) => setLabelPreset(e.target.value as ThreatLabelPreset)}
                    className="h-4 w-4"
                  />
                  <span className="font-medium">Shoot / No-Shoot</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent">
                  <input
                    type="radio"
                    name="threatLabelPreset"
                    value="CUSTOM"
                    checked={labelPreset === "CUSTOM"}
                    onChange={(e) => setLabelPreset(e.target.value as ThreatLabelPreset)}
                    className="h-4 w-4"
                  />
                  <span className="font-medium">Custom</span>
                </label>
              </div>
              {labelPreset === "CUSTOM" && (
                <div className="space-y-2 pl-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Threat Label</label>
                    <input
                      type="text"
                      value={customThreatLabel}
                      onChange={(e) => setCustomThreatLabel(e.target.value)}
                      placeholder="Threat"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Non-Threat Label</label>
                    <input
                      type="text"
                      value={customNonThreatLabel}
                      onChange={(e) => setCustomNonThreatLabel(e.target.value)}
                      placeholder="Non-Threat"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Always render to reserve space, but only show when needed to prevent CLS */}
          <p className={`text-sm text-destructive min-h-[1.25rem] ${!canStart ? '' : 'invisible'}`}>
            Please enable at least one media type to start a session.
          </p>

          <div className="flex gap-2 flex-wrap">
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
            <Button variant="outline" asChild>
              <Link href="/media-gallery">View Gallery</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Always render to reserve space, but only show content on Android to prevent CLS */}
      <Card className={`border-primary/50 bg-primary/5 ${!isAndroid ? 'invisible' : ''}`}>
        <CardHeader>
          <CardTitle>Try the Android App</CardTitle>
          <CardDescription>
            Get the full native experience with the Target Discriminator Android app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            For the best experience on Android devices, check out our native app on the Google Play Store.
          </p>
          <Button asChild className="w-full">
            <a
              href="https://play.google.com/store/apps/details?id=com.targetdiscriminator&pcampaignid=web_share"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get it on Google Play
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SessionConfigPage() {
  return (
    <AgeVerificationGuard>
      <SessionConfigPageContent />
    </AgeVerificationGuard>
  )
}

