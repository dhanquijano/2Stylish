# User Management Feature - Implementation Summary

## Overview
Added a complete user management system in the admin panel where admins can create accounts, assign roles, and send temporary passwords via email. Users are required to change their password on first login.

## Features Implemented

### 1. Database Schema Updates
- **File**: `database/schema.ts`
- Added `requirePasswordChange` field to users table (0 = false, 1 = true)
- **Migration**: `migrations/add-require-password-change.sql`

### 2. Email Service
- **File**: `lib/email-service.ts`
- Added `sendAccountCredentialsEmail()` function
- Sends branded welcome email with:
  - Temporary password
  - User role
  - Login link
  - Security tips
  - Password change requirement notice

### 3. API Endpoints

#### `/api/admin/users` (Admin Only)
- **GET**: Fetch all users
- **POST**: Create new user
  - Generates 8-character temporary password
  - Sends credentials via email
  - Sets `requirePasswordChange = 1`
- **PUT**: Update user details (name, email, role, branch)
- **DELETE**: Delete user (cannot delete self)

#### `/api/auth/change-password`
- **POST**: Change password for authenticated user
  - Validates current password
  - Updates to new password
  - Sets `requirePasswordChange = 0`

### 4. Admin Panel Pages

#### `/admin/users` - User Management Page
- **Features**:
  - View all users in a table
  - Create new users with form dialog
  - Edit existing users
  - Delete users
  - Display user status (Active / Pending Password Change)
  - Show role badges with colors
  - Show branch assignments
  - Show creation dates

#### `/change-password` - Password Change Page
- **Features**:
  - Form with current password, new password, confirm password
  - Password visibility toggles
  - Password requirements display
  - Validation (min 8 characters, passwords match)
  - Auto-redirect after successful change

### 5. Authentication Updates

#### `auth.ts`
- Added `requirePasswordChange` to User interface
- Added to JWT token
- Added to session
- Handles session update after password change

#### `next-auth.d.ts`
- Updated TypeScript types to include `requirePasswordChange`

### 6. Middleware & Guards

#### `components/PasswordChangeGuard.tsx`
- Client-side component that checks if user needs to change password
- Automatically redirects to `/change-password` if required
- Skips check for auth pages and change-password page itself

#### `app/layout.tsx`
- Wrapped app with `PasswordChangeGuard`

### 7. Navigation Updates

#### `lib/admin-utils.ts`
- Added "User Management" link to admin navigation
- Only visible to ADMIN and MANAGER roles

## User Flow

### Creating a New User (Admin)
1. Admin goes to `/admin/users`
2. Clicks "Create User" button
3. Fills in form:
   - Full Name (required)
   - Email (required)
   - Role (required): USER, STAFF, MANAGER, ADMIN
   - Branch (optional)
4. Clicks "Create User"
5. System:
   - Generates 8-character temporary password
   - Creates user account with `requirePasswordChange = 1`
   - Sends email with credentials to user
   - Shows success message

### First Login (New User)
1. User receives email with temporary password
2. User goes to `/sign-in`
3. Enters email and temporary password
4. System authenticates user
5. `PasswordChangeGuard` detects `requirePasswordChange = true`
6. User is automatically redirected to `/change-password`
7. User must change password before accessing any other page
8. After successful password change:
   - `requirePasswordChange` is set to 0
   - Session is updated
   - User is redirected to home page

## Security Features

1. **Temporary Passwords**: 8-character random hex strings (uppercase)
2. **Password Requirements**: Minimum 8 characters
3. **One-Time Use**: Temporary passwords must be changed on first login
4. **Email Verification**: Credentials sent only to registered email
5. **Role-Based Access**: Only ADMIN role can manage users
6. **Self-Protection**: Admins cannot delete their own account
7. **Secure Hashing**: bcrypt with 10 rounds

## Testing

### To Test User Creation:
1. Login as ADMIN
2. Go to `http://localhost:3000/admin/users`
3. Click "Create User"
4. Fill in the form and submit
5. Check the email inbox for credentials
6. (In development, temporary password is also returned in API response)

### To Test Password Change Flow:
1. Use the credentials from the email
2. Login at `/sign-in`
3. You should be automatically redirected to `/change-password`
4. Enter temporary password and new password
5. Submit and verify redirect to home page

### To Test Email Sending:
Visit: `http://localhost:3000/api/test-reset-email?email=your-email@example.com`

## Environment Variables Required

```env
RESEND_TOKEN=your_resend_api_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Migration

Run the migration to add the new column:

```sql
-- migrations/add-require-password-change.sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS require_password_change INTEGER DEFAULT 0;

UPDATE users 
SET require_password_change = 0 
WHERE require_password_change IS NULL;
```

## Files Created/Modified

### Created:
- `migrations/add-require-password-change.sql`
- `app/api/admin/users/route.ts`
- `app/api/auth/change-password/route.ts`
- `app/admin/users/page.tsx`
- `app/(auth)/change-password/page.tsx`
- `components/PasswordChangeGuard.tsx`
- `USER_MANAGEMENT_FEATURE.md`

### Modified:
- `database/schema.ts` - Added requirePasswordChange field
- `lib/email-service.ts` - Added sendAccountCredentialsEmail function
- `lib/admin-utils.ts` - Added User Management nav item
- `auth.ts` - Added requirePasswordChange to session
- `next-auth.d.ts` - Updated TypeScript types
- `app/layout.tsx` - Added PasswordChangeGuard

## Role Permissions

| Feature | ADMIN | MANAGER | STAFF | USER |
|---------|-------|---------|-------|------|
| View Users | ✅ | ✅ | ❌ | ❌ |
| Create Users | ✅ | ❌ | ❌ | ❌ |
| Edit Users | ✅ | ❌ | ❌ | ❌ |
| Delete Users | ✅ | ❌ | ❌ | ❌ |
| Change Own Password | ✅ | ✅ | ✅ | ✅ |

Note: Currently only ADMIN role has full user management access. This can be extended to MANAGER role if needed.

## Future Enhancements

1. Password strength meter
2. Password history (prevent reusing old passwords)
3. Account activation/deactivation
4. Bulk user import
5. User activity logs
6. Password expiration policies
7. Two-factor authentication
8. Email verification before account activation
