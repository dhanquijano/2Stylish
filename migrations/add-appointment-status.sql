-- Create appointment status enum
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no-show');

-- Add status column to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS status appointment_status DEFAULT 'pending' NOT NULL;

-- Add salesId column to link to sales records
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS sales_id TEXT;

-- Add updatedAt column
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);

-- Set existing appointments to appropriate status based on date/time
UPDATE appointments 
SET status = CASE 
  WHEN appointment_date || ' ' || appointment_time < NOW()::TEXT THEN 'pending'::appointment_status
  ELSE 'pending'::appointment_status
END
WHERE status IS NULL;
