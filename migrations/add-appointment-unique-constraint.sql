-- Add unique constraint to prevent double booking of the same barber at the same time
-- This ensures that a barber cannot be booked twice for the same date, time, and branch

-- First, check if there are any duplicate bookings that would violate the constraint
-- If there are duplicates, you'll need to clean them up before adding the constraint

-- Create a unique index on appointment_date, appointment_time, branch, and barber
-- This prevents the same barber from being booked at the same time and branch
CREATE UNIQUE INDEX IF NOT EXISTS appointments_unique_booking_idx 
ON appointments (appointment_date, appointment_time, branch, barber)
WHERE barber != '';  -- Only apply constraint when a specific barber is selected (not "no preference")

-- Note: The WHERE clause ensures that "no preference" bookings (empty barber string) 
-- are not subject to this constraint, allowing multiple bookings at the same time
-- when users don't specify a barber preference.
