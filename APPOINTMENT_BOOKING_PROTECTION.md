# Appointment Booking Protection

## Overview
The appointment booking system now has multiple layers of protection to prevent double-booking of barbers at the same date and time.

## Protection Layers

### 1. Frontend Validation
- **Real-time availability checking**: When users select a date and barber, the system fetches available time slots
- **Disabled time slots**: Already booked times are shown as unavailable and cannot be selected
- **Auto-refresh**: Time slots refresh every 30 seconds to show the latest availability

### 2. Backend Validation (Application Level)
Located in `lib/actions/appointments.ts`:

```typescript
// Before creating an appointment, the system checks:
1. If the barber is already booked at that time
2. If the barber has a scheduled shift at that time
3. If the barber is on approved leave
```

### 3. Database-Level Protection
Located in `database/schema.ts`:

```typescript
// Unique index on appointments table
uniqueBooking: index("appointments_unique_booking_idx").on(
  table.appointmentDate,
  table.appointmentTime,
  table.branch,
  table.barber
)
```

This prevents duplicate bookings even in race conditions where two users try to book the same slot simultaneously.

### 4. Race Condition Handling
The `createAppointment` function now catches database unique constraint violations:

```typescript
try {
  await db.insert(appointments).values({...});
} catch (insertError: any) {
  if (insertError?.code === '23505' || insertError?.message?.includes('duplicate')) {
    return {
      success: false,
      error: "This time slot was just booked by another user. Please select a different time.",
    };
  }
}
```

## How It Works

### Booking Flow
1. User selects branch and barber
2. System fetches available dates based on barber's schedule
3. User selects a date
4. System generates time slots and marks unavailable ones:
   - Already booked by another appointment
   - Outside barber's shift hours
   - During barber's break time
   - During barber's approved leave
   - Past times (if today)
5. User selects an available time slot
6. On submission:
   - Backend validates availability again
   - Checks for conflicts
   - Attempts to insert into database
   - Database enforces unique constraint
   - Returns success or appropriate error message

### Special Cases

#### "No Preference" Bookings
When a user selects "No Preference" for barber:
- All time slots are shown as available
- No conflict checking is performed
- The unique constraint doesn't apply (barber field is empty)
- Admin can assign a specific barber later

#### Concurrent Bookings
If two users try to book the same barber at the same time:
1. First user's request reaches the database first → Success
2. Second user's request hits the unique constraint → Error message shown
3. Second user is prompted to select a different time

## Migration

To apply the database constraint to an existing database, run:

```bash
# Using Drizzle
npm run db:migrate

# Or manually execute the SQL
psql your_database < migrations/add-appointment-unique-constraint.sql
```

## Testing

To test the double-booking protection:

1. Open two browser windows
2. Log in as different users (or use incognito mode)
3. Select the same branch, barber, date, and time in both windows
4. Try to submit both appointments simultaneously
5. One should succeed, the other should show an error message

## Error Messages

Users will see different error messages based on the issue:

- **"This time slot is already booked"**: Another appointment exists
- **"This time slot was just booked by another user"**: Race condition detected
- **"Staff member is not available at this time"**: Outside shift hours or on break
- **"Staff member is on approved leave"**: Barber has approved leave

## Future Enhancements

Potential improvements:
- Add optimistic locking with version numbers
- Implement a booking queue system
- Add a "hold" mechanism for 5 minutes while user completes booking
- Send real-time notifications when slots become available
