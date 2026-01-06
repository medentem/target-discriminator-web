# Vercel Deployment Guide

## Pre-Deployment Checklist

✅ **Code is ready:**
- All TypeScript types are correct
- No console errors in development
- Client-side only code is properly guarded (`typeof window !== "undefined"`)
- All dependencies are in `package.json`

✅ **Build process:**
- Media manifest generation script runs during build
- Build command: `npm run build` (includes manifest generation)
- No server-side code that requires Node.js APIs at runtime

✅ **Static assets:**
- All media files are in `public/media/` directory
- Media files will be served as static assets by Vercel
- File paths use relative paths from public root (`/media/...`)

✅ **Storage:**
- Uses client-side storage only (localStorage, IndexedDB)
- No backend API required
- No environment variables needed

## Deployment Steps

1. **Push to Git repository**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Vercel will auto-detect Next.js

3. **Configure Build Settings**
   - **Root Directory**: `web` (if deploying from monorepo root)
   - **Build Command**: `npm run build` (already set in package.json)
   - **Output Directory**: `.next` (default for Next.js)
   - **Install Command**: `npm install` (default)

4. **Deploy**
   - Click "Deploy"
   - Vercel will:
     1. Install dependencies
     2. Run `npm run build` (which runs manifest generation)
     3. Deploy the app

## Potential Issues & Solutions

### Issue: Media files not loading
**Solution**: Ensure all media files are committed to Git and in `public/media/` directory. Vercel serves files from `public/` as static assets.

### Issue: Build fails during manifest generation
**Solution**: The script filters out hidden files (`.DS_Store`, `.gitkeep`). If build fails, check:
- Media files exist in `public/media/`
- File permissions are correct
- No special characters in filenames that break the script

### Issue: IndexedDB not working
**Solution**: IndexedDB is browser-only and requires HTTPS in production. Vercel provides HTTPS by default.

### Issue: Large media files
**Solution**: Vercel has a 100MB limit per file. If videos are too large:
- Consider compressing videos
- Use a CDN for media files
- Or use Vercel Blob Storage for user-uploaded media

## Post-Deployment

1. **Test the app:**
   - Age verification page loads
   - Session configuration works
   - Training session plays media correctly
   - Touch gestures work on mobile
   - Media management allows upload/delete

2. **Check browser console:**
   - No errors in production
   - Media files load correctly
   - Storage operations work

3. **Test on mobile:**
   - Touch gestures work
   - Video playback works
   - Responsive design is correct

## Environment Variables

No environment variables are required for this deployment. All functionality uses client-side storage.

## Custom Domain

If you want to use a custom domain:
1. Go to Vercel project settings
2. Add your domain
3. Update DNS records as instructed

## Monitoring

Consider adding:
- Vercel Analytics (optional)
- Error tracking (Sentry, etc.)
- Performance monitoring

## Troubleshooting

If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify `package.json` scripts are correct
3. Ensure Node.js version is 18+ (Vercel default)
4. Check that all dependencies are in `package.json` (not just devDependencies)

If app doesn't work after deployment:
1. Check browser console for errors
2. Verify media files are accessible (check Network tab)
3. Test localStorage/IndexedDB in browser DevTools
4. Check if HTTPS is required (Vercel provides this automatically)

