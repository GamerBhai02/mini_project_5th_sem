# Security Notes

## Known Issues

### Development Dependencies (Non-Critical)

**esbuild vulnerability (Moderate Severity)** - GHSA-67mh-4wv8-2f99
- **Status**: Known, dev-only issue
- **Impact**: Affects development server only, not production builds
- **Description**: esbuild enables any website to send requests to the development server
- **Mitigation**: 
  - This vulnerability only affects the development environment
  - Production builds are not affected
  - Do not expose development server to untrusted networks
  - Always run `npm run dev` on localhost only
- **Future Action**: Upgrade to vite 7.x when stable and compatible with all dependencies

### Environment Variables

⚠️ **Important**: Never commit sensitive environment variables to the repository.

The following files are excluded from version control:
- `.env`
- `.env.local`
- `.env.*.local`

Always use `.env.example` as a template and create your own `.env` file locally.

### API Keys

This application requires:
1. **Gemini API Key**: Store securely, never commit to repository
2. **Supabase Keys**: Use anon key for client-side, never commit service role key

### Supabase Security

The application uses Row Level Security (RLS) policies:
- Only authenticated users can access the documents table
- Storage bucket is private, accessible only to authenticated users
- Admin authentication required for document management

### Production Deployment

When deploying to production (Vercel):
1. Set all environment variables in the Vercel dashboard
2. Enable Vercel's security features
3. Use HTTPS only
4. Review and update Supabase RLS policies as needed

## Reporting Security Issues

If you discover a security vulnerability, please email the repository owner directly. Do not create a public issue.

## Security Best Practices

1. Keep dependencies up to date (but test thoroughly before upgrading)
2. Never expose API keys or sensitive data
3. Use environment variables for all configuration
4. Implement proper authentication and authorization
5. Regularly review and update Supabase policies
6. Monitor Vercel deployment logs for suspicious activity

## Compliance

This application:
- Uses HTTPS in production
- Implements Row Level Security
- Separates environment configuration
- Follows secure coding practices
- Uses trusted third-party services (Google Gemini, Supabase, Vercel)
