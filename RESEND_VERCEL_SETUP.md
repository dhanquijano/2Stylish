# Resend Email Setup for Vercel Deployment

## Overview
This guide explains how to configure Resend email service to work on Vercel using the default domain `onboarding@resend.dev`, which requires no DNS configuration.

## Why Use the Default Domain?

Resend provides a default domain (`onboarding@resend.dev`) that:
- ✅ Works immediately without DNS setup
- ✅ Perfect for development and testing
- ✅ Works on Vercel deployments out of the box
- ✅ No domain verification required
- ✅ Free tier includes 100 emails/day

## Environment Variables Setup

### 1. Get Your Resend API Key

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `re_`)

### 2. Add to Vercel Environment Variables

In your Vercel project:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```env
# Required: Resend API Token
RESEND_TOKEN=re_your_api_key_here

# Required: Your app URL (Vercel provides this automatically)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Optional: For production URL (Vercel sets this automatically)
VERCEL_URL=your-app.vercel.app
```

### 3. Local Development (.env.local)

```env
RESEND_TOKEN=re_your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Email Configuration

All email functions now use:
- **From Address**: `Sanbry Grooming <onboarding@resend.dev>`
- **Domain**: Resend's default domain (no DNS setup needed)

### Email Functions Available

1. **Contact Form Emails** (`sendContactEmail`)
   - Sends customer inquiries to admin
   - Includes reply-to for direct customer response

2. **Password Reset Emails** (`sendPasswordResetEmail`)
   - Sends password reset links
   - 1-hour expiration
   - Secure token-based

3. **Account Credentials Emails** (`sendAccountCredentialsEmail`)
   - Sends new user credentials
   - Temporary password included
   - Login instructions

## URL Handling for Vercel

The system automatically detects the correct URL:

```typescript
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
               (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
               "http://localhost:3000");
```

Priority:
1. `NEXT_PUBLIC_APP_URL` (if set)
2. `VERCEL_URL` (Vercel automatic)
3. `http://localhost:3000` (fallback)

## Testing Email Functionality

### Local Testing

```bash
# Test password reset email
curl http://localhost:3000/api/test-reset-email?email=test@example.com

# Test contact form
# Use the contact form at /contact

# Test user creation (admin only)
# Use the user management page at /admin/users
```

### Production Testing

```bash
# Test password reset email
curl https://your-app.vercel.app/api/test-reset-email?email=test@example.com
```

## Vercel Deployment Checklist

- [ ] Add `RESEND_TOKEN` to Vercel environment variables
- [ ] Add `NEXT_PUBLIC_APP_URL` to Vercel environment variables
- [ ] Deploy to Vercel
- [ ] Test email sending from production
- [ ] Verify links in emails point to correct domain

## Email Sending Limits

### Resend Free Tier
- 100 emails per day
- 3,000 emails per month
- Default domain included
- No credit card required

### Resend Pro Tier ($20/month)
- 50,000 emails per month
- Custom domain support
- Priority support
- Advanced analytics

## Troubleshooting

### Email Not Sending

1. **Check Resend Token**
   ```bash
   # In Vercel logs, look for:
   RESEND_TOKEN not configured
   ```
   Solution: Add `RESEND_TOKEN` to environment variables

2. **Check API Response**
   ```bash
   # Look for Resend API errors in logs:
   Resend API error response: {...}
   ```
   Common errors:
   - `401`: Invalid API key
   - `429`: Rate limit exceeded
   - `422`: Invalid email format

3. **Check Email Delivery**
   - Check spam folder
   - Verify recipient email is correct
   - Check Resend dashboard for delivery status

### Links Not Working

1. **Check NEXT_PUBLIC_APP_URL**
   ```bash
   # Should be your production URL
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

2. **Verify in Email**
   - Open received email
   - Check if links point to correct domain
   - Should be `https://your-app.vercel.app/...`

## Upgrading to Custom Domain (Optional)

If you want to use your own domain (e.g., `noreply@yourdomain.com`):

1. **Add Domain in Resend**
   - Go to Resend Dashboard → Domains
   - Add your domain
   - Add DNS records to your domain provider

2. **Update Email Service**
   ```typescript
   // In lib/email-service.ts
   const fromEmail = 'Sanbry Grooming <noreply@yourdomain.com>';
   ```

3. **Verify Domain**
   - Wait for DNS propagation (up to 48 hours)
   - Verify in Resend dashboard

## Code Changes Made

### Files Updated:
1. `lib/email-service.ts`
   - Updated all `fromEmail` to use `'Sanbry Grooming <onboarding@resend.dev>'`
   - Added better error logging
   - Added URL fallback for Vercel

2. `app/api/auth/forgot-password/route.ts`
   - Updated URL handling for Vercel
   - Added VERCEL_URL fallback

### Key Changes:
```typescript
// Before
const fromEmail = 'onboarding@resend.dev';

// After
const fromEmail = 'Sanbry Grooming <onboarding@resend.dev>';

// URL Handling
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
               (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
               "http://localhost:3000");
```

## Monitoring

### Resend Dashboard
- View sent emails
- Check delivery status
- Monitor usage
- View error logs

### Vercel Logs
```bash
# View logs in Vercel dashboard
# Or use Vercel CLI
vercel logs
```

Look for:
- `Sending ... email via Resend...`
- `Email sent successfully`
- `Resend API error response`

## Best Practices

1. **Always Use Environment Variables**
   - Never hardcode API keys
   - Use different keys for dev/prod

2. **Handle Errors Gracefully**
   - Don't expose email sending errors to users
   - Log errors for debugging
   - Return generic success messages

3. **Test Before Deploying**
   - Test locally first
   - Test on Vercel preview deployment
   - Verify all email types work

4. **Monitor Usage**
   - Check Resend dashboard regularly
   - Watch for rate limits
   - Upgrade plan if needed

## Support

- **Resend Documentation**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **Vercel Documentation**: https://vercel.com/docs

## Summary

✅ Using `onboarding@resend.dev` (default domain)
✅ No DNS configuration required
✅ Works on Vercel immediately
✅ Automatic URL detection for Vercel
✅ All email functions updated
✅ Ready for production deployment

Just add your `RESEND_TOKEN` to Vercel environment variables and deploy!
