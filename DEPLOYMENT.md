# Deployment Checklist

## ✅ Fixed Issues:
- Removed vercel.json (not needed for Next.js)
- Build works locally
- ESLint warnings are non-blocking

## Environment Variables Needed on Vercel:

### Database
- `DATABASE_URL`: postgresql://postgres.qmzskawdngigxszsyglw:%3F9jkT.B%235ehhdKx@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
- `DIRECT_URL`: postgresql://postgres.qmzskawdngigxszsyglw:%3F9jkT.B%235ehhdKx@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

### Authentication
- `JWT_SECRET`: Indflaon x)(*()bpoqkwvq2983ry<KJHTR$%^&*%i8ypw9fcmadofafer][]
- `BCRYPT_ROUNDS`: 12
- `COOKIE_NAME`: auth-token
- `COOKIE_MAX_AGE`: 604800

### App Configuration
- `NEXT_PUBLIC_APP_URL`: https://your-app-name.vercel.app (update this after deployment)
- `NODE_ENV`: production

### AI Service
- `GEMINI_API_KEY`: AIzaSyBdgxaYi-BkMGVKOT7bcN0b6fakA4-Ukc4

## Deployment Steps:

1. ✅ Push code to GitHub repository (including the fix)
   ```bash
   git add .
   git commit -m "Fix: Remove vercel.json for proper Next.js deployment"
   git push origin main
   ```

2. ✅ Redeploy on Vercel (it should work now)

3. ✅ Add environment variables in Vercel dashboard

4. ✅ Update NEXT_PUBLIC_APP_URL with actual domain

5. ✅ Test all functionality

## Quick Fix Command:
```bash
git add . && git commit -m "Fix vercel deployment config" && git push origin main
```

## Post-Deployment Testing:
- [ ] Authentication (login/register)
- [ ] Dashboard access
- [ ] Company data upload
- [ ] Widget key generation
- [ ] Widget chat functionality
- [ ] Database connections
