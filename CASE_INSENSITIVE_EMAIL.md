# Case-Insensitive Email Login

## Overview
Email addresses are now case-insensitive throughout the application. Users can log in with any combination of uppercase and lowercase letters in their email address.

## Changes Made

### 1. Authentication (Login)
**File**: `auth.ts`

- Updated email query to use SQL `LOWER()` function for case-insensitive comparison
- Users can now log in with `User@Example.com`, `user@example.com`, or `USER@EXAMPLE.COM`

```typescript
const user = await db
  .select()
  .from(users)
  .where(sql`LOWER(${users.email}) = LOWER(${credentials.email.toString()})`)
  .limit(1);
```

### 2. User Registration (Sign Up)
**File**: `lib/actions/auth.ts`

- Email existence check is now case-insensitive
- New emails are stored in lowercase for consistency

```typescript
// Check if user exists (case-insensitive)
const existingUser = await db
  .select()
  .from(users)
  .where(sql`LOWER(${users.email}) = LOWER(${email})`)
  .limit(1);

// Store email in lowercase
await db.insert(users).values({
  fullName,
  email: email.toLowerCase(),
  password: hashedPassword,
});
```

### 3. Admin User Creation
**File**: `app/api/admin/users/route.ts`

- Email existence check is case-insensitive
- New user emails are stored in lowercase

```typescript
// Check if user exists (case-insensitive)
const existingUser = await db
  .select()
  .from(users)
  .where(sql`LOWER(${users.email}) = LOWER(${email})`)
  .limit(1);

// Store email in lowercase
const newUser = await db
  .insert(users)
  .values({
    fullName,
    email: email.toLowerCase(),
    password: hashedPassword,
    // ...
  });
```

### 4. Forgot Password
**File**: `app/api/auth/forgot-password/route.ts`

- Email lookup is now case-insensitive

```typescript
const user = await db
  .select()
  .from(users)
  .where(sql`LOWER(${users.email}) = LOWER(${email})`)
  .limit(1);
```

## How It Works

### Login Examples
All of these will work for the same user:
- `john@example.com`
- `John@Example.com`
- `JOHN@EXAMPLE.COM`
- `JoHn@ExAmPlE.cOm`

### Database Storage
- All new emails are stored in lowercase: `john@example.com`
- This ensures consistency and prevents duplicate accounts with different cases

### Existing Users
- Existing users with uppercase letters in their email can still log in
- The case-insensitive comparison works regardless of how the email is stored
- Optionally, you can run a migration to normalize existing emails to lowercase

## Benefits

1. **Better User Experience**: Users don't need to remember the exact case of their email
2. **Prevents Duplicates**: Can't create `user@example.com` and `User@Example.com` as separate accounts
3. **Consistency**: All new emails stored in lowercase format
4. **Security**: No information leakage about email case sensitivity

## Optional: Normalize Existing Emails

If you want to normalize all existing emails to lowercase, you can run this SQL:

```sql
UPDATE users SET email = LOWER(email);
```

Or create a migration file:

```sql
-- migrations/normalize-emails.sql
UPDATE users SET email = LOWER(email) WHERE email != LOWER(email);
```

## Testing

### Test Case 1: Login with Different Cases
1. Create user with email: `test@example.com`
2. Try logging in with:
   - `test@example.com` ✓
   - `Test@Example.com` ✓
   - `TEST@EXAMPLE.COM` ✓
   - `TeSt@ExAmPlE.cOm` ✓

### Test Case 2: Prevent Duplicate Registration
1. Create user with email: `user@example.com`
2. Try to register with: `User@Example.com`
3. Should show error: "User with this email already exists"

### Test Case 3: Forgot Password
1. Register with: `john@example.com`
2. Request password reset with: `JOHN@EXAMPLE.COM`
3. Should receive reset email

### Test Case 4: Admin User Creation
1. Create user via admin with: `admin@example.com`
2. Try to create another user with: `Admin@Example.com`
3. Should show error: "User with this email already exists"

## Files Modified

- `auth.ts` - Login authentication
- `lib/actions/auth.ts` - User registration
- `app/api/admin/users/route.ts` - Admin user creation
- `app/api/auth/forgot-password/route.ts` - Password reset

## Technical Details

### SQL LOWER() Function
The `LOWER()` function is used for case-insensitive comparison:
```typescript
sql`LOWER(${users.email}) = LOWER(${email})`
```

This works with:
- MySQL
- PostgreSQL
- SQLite
- Most SQL databases

### Email Normalization
Emails are normalized to lowercase when stored:
```typescript
email: email.toLowerCase()
```

This ensures:
- Consistent storage format
- Easier database queries
- No case-related bugs

## Notes

- Email comparison is case-insensitive for login, registration, and password reset
- All new emails are stored in lowercase
- Existing emails with uppercase letters will still work
- No breaking changes for existing users
