# Password Change Flow Diagram

## First-Time Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User logs in with temporary password                         │
│    POST /api/auth/signin                                        │
│    → Session created with requirePasswordChange: true          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Browser navigates to "/"                                     │
│    (AuthForm calls router.push("/"))                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Auth Layout intercepts (if coming from auth pages)           │
│    app/(auth)/layout.tsx                                        │
│    ✓ User is authenticated                                      │
│    ✓ Query DB: requirePasswordChange = 1                       │
│    → redirect("/change-password")                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Change Password Layout allows access                         │
│    app/change-password/layout.tsx                               │
│    ✓ User is authenticated                                      │
│    → Allow access                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. User sees change password form                               │
│    app/change-password/page.tsx                                 │
│    → User enters current and new password                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Password change submitted                                    │
│    POST /api/auth/change-password                               │
│    → DB updated: requirePasswordChange = 0                      │
│    → window.location.href = "/" (full page reload)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Browser navigates to "/" (fresh request)                     │
│    → New session loaded from server                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. Root Layout checks password requirement                      │
│    app/(root)/layout.tsx                                        │
│    ✓ User is authenticated                                      │
│    ✓ Query DB: requirePasswordChange = 0                       │
│    → Allow access to home page                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. User sees home page                                          │
│    ✓ Can now navigate freely                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Subsequent Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User logs in with new password                               │
│    POST /api/auth/signin                                        │
│    → Session created with requirePasswordChange: false         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Browser navigates to "/"                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Auth Layout intercepts                                       │
│    app/(auth)/layout.tsx                                        │
│    ✓ User is authenticated                                      │
│    ✓ Query DB: requirePasswordChange = 0                       │
│    → redirect("/") to home                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Root Layout allows access                                    │
│    app/(root)/layout.tsx                                        │
│    ✓ User is authenticated                                      │
│    ✓ Query DB: requirePasswordChange = 0                       │
│    → Allow access                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. User sees home page                                          │
│    ✓ No password change required                                │
└─────────────────────────────────────────────────────────────────┘
```

## Accessing Admin Panel (First Time)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User with requirePasswordChange=1 navigates to /admin        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Admin Layout intercepts                                      │
│    app/admin/layout.tsx                                         │
│    ✓ User is authenticated                                      │
│    ✓ Query DB: requirePasswordChange = 1                       │
│    → redirect("/change-password")                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. User changes password                                        │
│    → Redirected to home page                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. User navigates to /admin again                               │
│    → Admin Layout checks: requirePasswordChange = 0            │
│    → Access granted                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Layout Hierarchy

```
app/
│
├── layout.tsx (Root)
│   └── Provides SessionProvider
│
├── (auth)/
│   ├── layout.tsx
│   │   └── Checks: If authenticated → Check DB → Redirect accordingly
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
│
├── (root)/
│   ├── layout.tsx
│   │   └── Checks: If requirePasswordChange=1 → Redirect to /change-password
│   ├── page.tsx (Home)
│   ├── appointments/page.tsx
│   └── contact/page.tsx
│
├── admin/
│   ├── layout.tsx
│   │   └── Checks: If requirePasswordChange=1 → Redirect to /change-password
│   ├── page.tsx
│   ├── users/page.tsx
│   └── appointments/page.tsx
│
└── change-password/
    ├── layout.tsx
    │   └── Checks: If NOT authenticated → Redirect to /sign-in
    └── page.tsx
```

## Key Points

### Why No Infinite Loop?

1. **Separate Route Groups**: `/change-password` is NOT in `(auth)` group
2. **Database as Source of Truth**: All layouts query DB for current state
3. **Full Page Reload**: After password change, ensures fresh session
4. **Clear Redirect Logic**: Each layout has specific redirect rules

### Redirect Rules by Layout

| Layout | Condition | Action |
|--------|-----------|--------|
| `(auth)/layout.tsx` | Authenticated + requirePasswordChange=1 | → `/change-password` |
| `(auth)/layout.tsx` | Authenticated + requirePasswordChange=0 | → `/` |
| `(auth)/layout.tsx` | Not authenticated | → Allow access |
| `(root)/layout.tsx` | Authenticated + requirePasswordChange=1 | → `/change-password` |
| `(root)/layout.tsx` | Authenticated + requirePasswordChange=0 | → Allow access |
| `admin/layout.tsx` | Not authenticated | → `/sign-in` |
| `admin/layout.tsx` | Authenticated + requirePasswordChange=1 | → `/change-password` |
| `admin/layout.tsx` | Authenticated + requirePasswordChange=0 | → Check role → Allow/Deny |
| `change-password/layout.tsx` | Not authenticated | → `/sign-in` |
| `change-password/layout.tsx` | Authenticated | → Allow access |

### Why Full Page Reload?

Using `window.location.href = "/"` instead of `router.push("/")` ensures:
1. Complete session refresh from server
2. All layouts re-evaluate with fresh data
3. No stale session data in client
4. Clean state for navigation
