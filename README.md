# Target Discriminator Web

Web version of the Target Discriminator training application for threat identification.

## Features

- **Age Verification**: Entry screen with age confirmation
- **Session Configuration**: Configure training sessions with videos/photos and duration
- **Training Session**: Interactive training with tap/swipe gestures
- **Media Management**: Import and manage custom training media
- **Session Statistics**: Track performance metrics

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building

```bash
npm run build
npm start
```

## Project Structure

```
web/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Age verification (entry)
│   ├── session-config/    # Session configuration
│   ├── training/          # Training session
│   └── media-management/  # Media management
├── components/            # React components
│   ├── ui/               # Base UI components (Shadcn)
│   └── training/         # Training-specific components
├── lib/                  # Core logic
│   ├── models/           # Domain models
│   ├── repositories/     # Data access layer
│   ├── hooks/            # Custom React hooks
│   ├── storage/          # Storage abstractions
│   └── data/             # Media manifest
├── public/               # Static assets
│   └── media/            # Training media files
└── scripts/              # Build scripts
```

## Media Files

Media files are stored in `public/media/`:
- `videos/threat/` - Threat videos
- `videos/non_threat/` - Non-threat videos
- `photos/threat/` - Threat photos
- `photos/non_threat/` - Non-threat photos

To regenerate the media manifest after adding files:

```bash
npm run generate-manifest
```

## Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn UI** - UI components
- **IndexedDB** - Client-side storage for user media
- **LocalStorage** - Session statistics

## Deployment

The app is configured for Vercel deployment. Simply connect your repository to Vercel and deploy.

## License

See LICENSE file.

