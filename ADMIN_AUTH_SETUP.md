# Admin Authentication Setup

## Overview

The admin system uses a secure password-based authentication system with JWT tokens stored in HTTP-only cookies.

## Default Admin Credentials

**Hardcoded Admin User (Fallback)**:
- Username: `admin`
- Password: `Secure123!`

This hardcoded user works as a fallback if the database is unavailable (e.g., during serverless cold starts or initial setup).

## Database Admin Users

You can also create admin users in the database using:

```bash
node scripts/init-admin.js
```

Or use the hardcoded script:

```bash
node scripts/create-admin.js
```

## Environment Variables

**Required**:
- `JWT_SECRET` - A strong random string for JWT token signing
  - Generate: `openssl rand -base64 32`
  - Set in Vercel Dashboard → Project Settings → Environment Variables

**If JWT_SECRET is not set**: Admin pages will show a configuration error.

## Protected Routes

All admin routes are protected and require authentication:

- `/admin` - Main admin dashboard
- `/admin/posts/new` - Create new blog post
- `/admin/posts/[id]/edit` - Edit blog post

Unauthenticated users are automatically redirected to `/admin/login`.

## How It Works

1. User submits credentials at `/admin/login`
2. Server verifies credentials (database first, then hardcoded fallback)
3. If valid, JWT token is created and stored in HTTP-only cookie
4. All admin routes check for valid JWT token
5. Token expires after 24 hours

## Security Features

- ✅ HTTP-only cookies (prevents XSS attacks)
- ✅ Secure cookies in production (HTTPS only)
- ✅ JWT tokens with expiration
- ✅ Bcrypt password hashing (for database users)
- ✅ Server-side authentication checks
- ✅ Automatic redirect to login if not authenticated

## Testing

1. Navigate to `/admin/login`
2. Enter credentials:
   - Username: `admin`
   - Password: `Secure123!`
3. You should be redirected to `/admin` dashboard
4. All admin routes should be accessible
5. Logout by clearing cookies or waiting 24 hours

## Troubleshooting

**Admin pages show blank/error**:
- Check that `JWT_SECRET` is set in Vercel environment variables
- Verify the admin login page loads at `/admin/login`
- Check browser console for errors

**Login fails**:
- Try the hardcoded admin credentials: `admin` / `Secure123!`
- Check that the database is accessible (if using database users)
- Verify API route `/api/auth/login` is working

**Redirects to login repeatedly**:
- Clear browser cookies
- Check that `JWT_SECRET` is properly configured
- Verify cookie settings (should be HTTP-only, secure in production)

