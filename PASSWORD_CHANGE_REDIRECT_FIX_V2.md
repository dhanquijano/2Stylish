# Password Change Redirect Fix V2

## Problem
Users with `requirePasswordChange=1` were experiencing infinite redirect loops when logging in for the first time. The issue persisted even after the first fix attempt.

## Root Cause Analysis
The infinite loop was caused by conflicting layout logic:

1. **Auth Layout Issue**: The `app/(auth)/layout.tsx` was redirecting ALL authenticated users to `/`
2. **Change Password Location**: The `/change-password` page was inside the `(auth)` route group
3. **Circular Redirect**: 
   - User logs in → redirected to `/` by auth layout
   - Root layout checks `requirePasswordChange` → redirects to `/change-password`
   - Auth layout sees authenticated user → redirects back to `/`
   - **INFINITE LOOP**

## Solution

### 1. Moved Change Password Page
**Before**: `app/(auth)/change-password/page.tsx`  
**After**: `app/change-password/page.tsx`

This removes the page from the auth route group, preventing the auth layout from interfering.

### 2. Created Dedicated Layout for Change Password
**File**: `app/change-password/layout.tsx`

```typescript
const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  // Redirect to sign-in if not authenticated
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return <>{children}</>;
};
```

This ensures only authenticated users can access the change password page.

### 3. Updated Auth Layout
**File**: `app/(auth)/layout.tsx`

```typescript
const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  // If user is authenticated, check if they need to change password
  if (session?.user?.id) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (user.length > 0 && user[0].requirePasswordChange === 1) {
      // Redirect to change password page
      redirect("/change-password");
    } else {
      // User is authenticated and doesn't need password change
      // Redirect to home
      redirect("/");
    }
  }

  return (
    // ... auth layout UI
  );
};
```

Now the auth layout:
- Checks if user needs password change
- Redirects to `/change-password` if needed
- Otherwise redirects to home

### 4. Updated Root Layout
**File**: `app/(root)/layout.tsx`

```typescript
const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (session?.user?.id) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    // Check if user needs to change password
    if (user.length > 0 && user[0].requirePasswordChange === 1) {
      redirect("/change-password");
    }

    // ... rest of the code
  }

  return (
    // ... root layout UI
  );
};
```

The root layout also checks for password change requirement and redirects if needed.

### 5. Updated Admin Layout
**File**: `app/admin/layout.tsx`

Already has the password change check from the previous fix.

## How It Works Now

### Route Structure
```
app/
├── (auth)/                    # Auth pages (sign-in, sign-up, etc.)
│   ├── layout.tsx            # Redirects authenticated users
│   ├── sign-in/
│   ├── sign-up/
│   ├── forgot-password/
│   └── reset-password/
├── (root)/                    # Public pages
│   ├── layout.tsx            # Checks password change requirement
│   └── page.tsx
├── admin/                     # Admin pages
│   ├── layout.tsx            # Checks password change requirement
│   └── ...
└── change-password/           # Standalone password change
    ├── layout.tsx            # Requires authentication
    └── page.tsx
```

### First-Time Login Flow

1. **User logs in with temporary password**
   - Submits credentials via sign-in form
   - NextAuth creates session with `requirePasswordChange: true`

2. **Auth layout intercepts**
   - Detects user is authenticated
   - Queries database for `requirePasswordChange` flag
   - Finds `requirePasswordChange = 1`
   - Redirects to `/change-password`

3. **Change password layout allows access**
   - Checks if user is authenticated (yes)
   - Allows access to change password page

4. **User changes password**
   - Submits new password
   - API updates database: `requirePasswordChange = 0`
   - Page does full reload: `window.location.href = "/"`

5. **Auth layout intercepts again**
   - Detects user is authenticated
   - Queries database for `requirePasswordChange` flag
   - Finds `requirePasswordChange = 0`
   - Redirects to home page `/`

6. **Root layout allows access**
   - Checks `requirePasswordChange` (now 0)
   - Allows normal access

### Subsequent Logins

1. **User logs in with new password**
   - Session has `requirePasswordChange: false`

2. **Auth layout intercepts**
   - Detects user is authenticated
   - Queries database: `requirePasswordChange = 0`
   - Redirects directly to home page `/`

3. **Root layout allows access**
   - No password change needed
   - Normal access granted

### Accessing Protected Routes

**Scenario**: User with `requirePasswordChange=1` tries to access `/admin`

1. **Admin layout intercepts**
   - Checks authentication (yes)
   - Checks `requirePasswordChange` (1)
   - Redirects to `/change-password`

2. **User changes password**
   - Returns to home page

3. **User navigates to `/admin` again**
   - Admin layout checks `requirePasswordChange` (now 0)
   - Access granted

## Key Improvements

1. **No Circular Redirects**: Change password page is outside auth route group
2. **Single Source of Truth**: Database is queried for current state
3. **Consistent Checks**: All protected layouts check password requirement
4. **Full Page Reload**: After password change, ensures session is fresh
5. **Clear Separation**: Auth pages, public pages, and change password are separate

## Files Changed

- `app/(auth)/layout.tsx` - Added password change check before redirect
- `app/(root)/layout.tsx` - Added password change check
- `app/change-password/page.tsx` - Moved from `(auth)` group
- `app/change-password/layout.tsx` - New dedicated layout
- `app/admin/layout.tsx` - Already has check (from previous fix)

## Testing Checklist

- [ ] Create new user via admin panel
- [ ] Log in with temporary password
- [ ] Should redirect to `/change-password` (no loops)
- [ ] Change password successfully
- [ ] Should redirect to home page
- [ ] Try accessing admin panel (should work)
- [ ] Log out and log in again with new password
- [ ] Should go directly to home (no password change prompt)
- [ ] Navigate between pages (no unexpected redirects)

## Debug Commands

```bash
# Check session
curl http://localhost:3000/api/debug/session-check

# Check user in database
curl http://localhost:3000/api/debug/check-user?email=test@example.com

# Clear password change flag
curl -X POST http://localhost:3000/api/debug/clear-password-flag \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Why This Works

The key insight is that `/change-password` must be:
1. **Outside the auth route group** - So authenticated users can access it
2. **Protected by its own layout** - To ensure only authenticated users can access it
3. **Checked by all other layouts** - To redirect users who need password change

This creates a clear flow:
- Auth pages → Check if password change needed → Redirect accordingly
- Protected pages → Check if password change needed → Redirect to change password
- Change password page → Standalone, accessible only when authenticated
