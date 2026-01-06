// Script to generate media manifest from public/media directory
// Run with: node scripts/generate-media-manifest.js

const fs = require('fs')
const path = require('path')

const mediaDir = path.join(__dirname, '../public/media')
const outputFile = path.join(__dirname, '../lib/data/media-manifest-generated.ts')

function getMediaItems() {
  const items = []
  
  // Videos
  const videoThreatDir = path.join(mediaDir, 'videos/threat')
  const videoNonThreatDir = path.join(mediaDir, 'videos/non_threat')
  
  if (fs.existsSync(videoThreatDir)) {
    const files = fs.readdirSync(videoThreatDir)
      .filter(f => {
        const isVideo = f.endsWith('.mp4') || f.endsWith('.webm')
        const isNotHidden = !f.startsWith('.')
        return isVideo && isNotHidden
      })
    files.forEach(file => {
      // Escape special characters in file paths
      const escapedPath = `/media/videos/threat/${file.replace(/"/g, '\\"')}`
      items.push({
        path: escapedPath,
        type: 'VIDEO',
        threatType: 'THREAT'
      })
    })
  }
  
  if (fs.existsSync(videoNonThreatDir)) {
    const files = fs.readdirSync(videoNonThreatDir)
      .filter(f => {
        const isVideo = f.endsWith('.mp4') || f.endsWith('.webm')
        const isNotHidden = !f.startsWith('.')
        return isVideo && isNotHidden
      })
    files.forEach(file => {
      const escapedPath = `/media/videos/non_threat/${file.replace(/"/g, '\\"')}`
      items.push({
        path: escapedPath,
        type: 'VIDEO',
        threatType: 'NON_THREAT'
      })
    })
  }
  
  // Photos
  const photoThreatDir = path.join(mediaDir, 'photos/threat')
  const photoNonThreatDir = path.join(mediaDir, 'photos/non_threat')
  
  if (fs.existsSync(photoThreatDir)) {
    const files = fs.readdirSync(photoThreatDir)
      .filter(f => {
        const isImage = f.match(/\.(png|jpg|jpeg|webp)$/i)
        const isNotHidden = !f.startsWith('.')
        return isImage && isNotHidden
      })
    files.forEach(file => {
      const escapedPath = `/media/photos/threat/${file.replace(/"/g, '\\"')}`
      items.push({
        path: escapedPath,
        type: 'PHOTO',
        threatType: 'THREAT'
      })
    })
  }
  
  if (fs.existsSync(photoNonThreatDir)) {
    const files = fs.readdirSync(photoNonThreatDir)
      .filter(f => {
        const isImage = f.match(/\.(png|jpg|jpeg|webp)$/i)
        const isNotHidden = !f.startsWith('.')
        return isImage && isNotHidden
      })
    files.forEach(file => {
      const escapedPath = `/media/photos/non_threat/${file.replace(/"/g, '\\"')}`
      items.push({
        path: escapedPath,
        type: 'PHOTO',
        threatType: 'NON_THREAT'
      })
    })
  }
  
  return items
}

const items = getMediaItems()

const output = `// Auto-generated media manifest
// Do not edit manually - run: node scripts/generate-media-manifest.js

import { MediaItem } from "@/lib/models/media-item"
import { MediaType, ThreatType } from "@/lib/models/types"

export const BUILT_IN_MEDIA: MediaItem[] = [
${items.map(item => {
  // Escape quotes and backslashes in the path
  const escapedPath = item.path.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `  { path: "${escapedPath}", type: MediaType.${item.type}, threatType: ThreatType.${item.threatType} },`
}).join('\n')}
]
`

try {
  fs.writeFileSync(outputFile, output)
  console.log(`Generated manifest with ${items.length} media items`)
  console.log(`Output: ${outputFile}`)
} catch (error) {
  console.error('Error generating media manifest:', error)
  process.exit(1)
}

