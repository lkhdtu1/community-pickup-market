-- Add dateOfBirth column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS "dateOfBirth" DATE;
