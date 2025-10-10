-- Add profile_picture column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Update existing users with default avatar if they don't have one
UPDATE users SET profile_picture = 'https://cdn-icons-png.flaticon.com/512/219/219983.png' 
WHERE profile_picture IS NULL;
