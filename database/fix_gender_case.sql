-- Migration to standardize gender values to lowercase
-- This fixes the inconsistency between simple and verified registration
-- Date: 2026-03-06

-- Update users_v2 table: Convert capitalized gender values to lowercase
UPDATE users_v2
SET gender = LOWER(gender)
WHERE gender IN ('Male', 'Female', 'Other', 'MALE', 'FEMALE', 'OTHER');

-- Verify the changes
SELECT 
  gender, 
  COUNT(*) as count
FROM users_v2
GROUP BY gender
ORDER BY gender;
