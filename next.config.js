/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // Enable aggressive caching for images
    minimumCacheTTL: 31536000, // 1 year
  },
  async headers() {
    return [
      {
        // Apply aggressive caching to all media files
        source: '/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

