"use client"

import { useState, useEffect, useMemo } from "react"
import { ThreatType, ThreatLabelConfig } from "@/lib/models/types"
import { LocalStorageService } from "@/lib/storage/local-storage"

export interface ThreatLabels {
  threat: string
  nonThreat: string
}

const PRESET_LABELS: Record<string, ThreatLabels> = {
  THREAT_NON_THREAT: {
    threat: "Threat",
    nonThreat: "Non-Threat",
  },
  SHOOT_NO_SHOOT: {
    threat: "Shoot",
    nonThreat: "No-Shoot",
  },
}

export function useThreatLabels(): ThreatLabels {
  const [config, setConfig] = useState<ThreatLabelConfig>(() => 
    LocalStorageService.getThreatLabelConfig()
  )

  useEffect(() => {
    // Listen for storage changes to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      // Storage events only fire for other tabs
      if (e.key === "threat_labels" || e.key === null) {
        setConfig(LocalStorageService.getThreatLabelConfig())
      }
    }

    // Listen for custom event for same-tab updates
    const handleConfigChange = () => {
      setConfig(LocalStorageService.getThreatLabelConfig())
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("threatLabelConfigChanged", handleConfigChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("threatLabelConfigChanged", handleConfigChange)
    }
  }, [])

  return useMemo(() => {
    if (config.preset === "CUSTOM") {
      return {
        threat: config.customThreatLabel || "Threat",
        nonThreat: config.customNonThreatLabel || "Non-Threat",
      }
    }
    return PRESET_LABELS[config.preset] || PRESET_LABELS.THREAT_NON_THREAT
  }, [config])
}

export function getThreatLabel(threatType: ThreatType, labels: ThreatLabels): string {
  return threatType === ThreatType.THREAT ? labels.threat : labels.nonThreat
}
