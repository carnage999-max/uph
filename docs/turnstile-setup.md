# Cloudflare Turnstile Setup Guide

## Overview
Cloudflare Turnstile is a privacy-friendly CAPTCHA alternative that protects your application form from spam bots.

## Step-by-Step Setup

### 1. Sign in to Cloudflare
- Go to [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
- Sign in with your Cloudflare account (or create one if needed)

### 2. Navigate to Turnstile
- In the left sidebar, click **Security** → **Turnstile**
- Or go directly to: [https://dash.cloudflare.com/?to=/:account/turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)

### 3. Create a New Site
- Click the **"Add site"** button
- Fill in the form:
  - **Site name**: `Ultimate Property Holdings` (or any name you prefer)
  - **Domain**: 
    - For production: `ultimatepropertyholdings.com` (or your actual domain)
    - For testing: `localhost` (allows local development)
  - **Widget mode**: 
    - **Managed** (recommended) - Shows a checkbox that verifies automatically
    - **Non-interactive** - Invisible verification
    - **Invisible** - Completely invisible to users
- Click **"Create"**

### 4. Get Your Keys
After creating the site, you'll see two keys:

1. **Site Key** (Public) - This is what you need for `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - This key is safe to expose in client-side code
   - Copy this value

2. **Secret Key** (Private) - Optional for server-side verification
   - Keep this secret
   - You can use this for additional server-side verification if needed

### 5. Configure Your Application

#### Local Development (.env.local)
Create or update `.env.local` in your project root:

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
```

#### AWS Amplify
1. Go to your Amplify app in the AWS Console
2. Navigate to **App settings** → **Environment variables**
3. Click **Manage variables**
4. Add a new variable:
   - **Key**: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - **Value**: Your site key from Cloudflare
5. Save and redeploy your app

### 6. Test the Integration

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to the application page: `/apply`

3. Fill out the form and proceed to the last step

4. You should see the Turnstile widget appear

5. Complete the verification and submit the form

### Troubleshooting

#### Widget Not Appearing
- Check that `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set correctly
- Verify the domain in Turnstile settings matches your domain (or includes `localhost` for testing)
- Check browser console for errors

#### "Invalid site key" Error
- Verify you copied the **Site Key** (not the Secret Key)
- Ensure the environment variable is prefixed with `NEXT_PUBLIC_`
- Restart your development server after adding the variable

#### Testing Locally
- Make sure your Turnstile site includes `localhost` in the allowed domains
- Or use the test site key: `1x00000000000000000000AA` (for development only)

### Additional Notes

- **Free Tier**: Cloudflare Turnstile is free for most use cases
- **Privacy**: Turnstile is GDPR compliant and privacy-friendly
- **Performance**: No impact on page load times
- **Server-side Verification**: Optional but recommended for production. You can verify tokens server-side using the Secret Key if needed.

### Resources

- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)

