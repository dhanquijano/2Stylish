-- Add requirePasswordChange column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS require_password_change INTEGER DEFAULT 0;

-- Set existing users to not require password change
UPDATE users 
SET require_password_change = 0 
WHERE require_password_change IS NULL;
