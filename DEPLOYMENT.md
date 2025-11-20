# Deployment Guide for Vercel

This guide will walk you through deploying the New Horizon College of Engineering AI Chatbot to Vercel.

## Prerequisites

Before deploying, make sure you have:
- ✅ A [Vercel account](https://vercel.com/signup)
- ✅ A [GitHub account](https://github.com/signup) (if deploying from GitHub)
- ✅ A [Gemini API key](https://aistudio.google.com/app/apikey)
- ✅ A [Supabase project](https://supabase.com) set up with the required tables and storage

## Deployment Options

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Fork or clone this repository to your GitHub account**

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

3. **Click "Add New" → "Project"**

4. **Import your GitHub repository**
   - Select the `mini_project_5th_sem` repository
   - Click "Import"

5. **Configure your project**
   - Framework Preset: Vite (should auto-detect)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. **Add Environment Variables**
   Click on "Environment Variables" and add:
   
   | Name | Value | Environment |
   |------|-------|-------------|
   | `API_KEY` | Your Gemini API key | Production, Preview, Development |
   | `SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
   | `SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |

7. **Click "Deploy"**
   - Vercel will build and deploy your application
   - Wait for the deployment to complete (usually 1-2 minutes)

8. **Visit your deployed site**
   - Vercel will provide you with a URL (e.g., `https://your-project.vercel.app`)
   - Your chatbot is now live!

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to project directory**
   ```bash
   cd mini_project_5th_sem
   ```

4. **Deploy**
   ```bash
   vercel
   ```

5. **Set environment variables**
   ```bash
   vercel env add API_KEY production
   vercel env add SUPABASE_URL production
   vercel env add SUPABASE_ANON_KEY production
   ```

6. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Post-Deployment Configuration

### 1. Verify Environment Variables

Go to your Vercel project settings:
- Navigate to Settings → Environment Variables
- Ensure all three variables are set correctly
- If you need to update them, edit and redeploy

### 2. Test Your Deployment

1. Visit your deployed URL
2. Check that the main page loads correctly
3. Click the chatbot icon (bottom right)
4. Try sending a test message
5. Test the admin panel (settings icon in chatbot)

### 3. Supabase CORS Configuration

If you encounter CORS errors:

1. Go to your Supabase dashboard
2. Navigate to Settings → API
3. Add your Vercel domain to the allowed origins:
   - `https://your-project.vercel.app`
   - `https://*.vercel.app` (for preview deployments)

### 4. Custom Domain (Optional)

To add a custom domain:

1. Go to your Vercel project
2. Navigate to Settings → Domains
3. Add your custom domain
4. Follow the DNS configuration instructions
5. Update Supabase CORS settings to include your custom domain

## Automatic Deployments

Once connected to GitHub, Vercel will automatically:
- Deploy every push to the main branch to production
- Create preview deployments for pull requests
- Run build checks on all commits

## Monitoring and Logs

### View Deployment Logs
1. Go to your Vercel project dashboard
2. Click on "Deployments"
3. Click on any deployment to view its logs

### View Runtime Logs
1. Go to your Vercel project dashboard
2. Navigate to the "Logs" tab
3. View real-time logs of your application

## Troubleshooting

### Build Failures

**Error: "Module not found"**
- Solution: Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Build command failed"**
- Solution: Check the build logs in Vercel
- Verify that `npm run build` works locally

### Runtime Errors

**Error: "API_KEY environment variable not set"**
- Solution: Add the API_KEY environment variable in Vercel settings
- Redeploy after adding the variable

**Error: "Failed to fetch from Supabase"**
- Solution: Check your Supabase URL and anon key
- Verify Supabase CORS settings
- Ensure Supabase RLS policies are correctly configured

**Error: "Cannot read properties of undefined"**
- Solution: Check browser console for detailed error
- Verify all environment variables are set
- Check Supabase connection

## Performance Optimization

### Enable Vercel Analytics (Optional)

1. Go to your project settings
2. Navigate to Analytics
3. Enable Web Analytics
4. Deploy to activate

### Enable Compression

Vercel automatically enables:
- Gzip compression
- Brotli compression
- Edge caching

No additional configuration needed!

### Edge Functions (Advanced)

For better performance, consider:
- Using Vercel Edge Functions for API calls
- Implementing edge caching strategies
- Using Incremental Static Regeneration (ISR)

## Security Checklist

Before going live, ensure:
- [ ] Environment variables are set in Vercel (not in code)
- [ ] `.env` file is in `.gitignore`
- [ ] Supabase RLS policies are enabled
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] API keys are rotated regularly
- [ ] CORS is properly configured in Supabase

## Updating Your Deployment

To update your deployed application:

1. **Make changes locally**
2. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. **Vercel automatically deploys the changes**
4. **Verify the deployment** in Vercel dashboard

## Rolling Back

If something goes wrong:

1. Go to Vercel dashboard → Deployments
2. Find the last working deployment
3. Click the three dots (...)
4. Select "Promote to Production"

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check browser console for errors
4. Review Supabase logs
5. Create an issue in the GitHub repository

---

**Happy Deploying! 🚀**
