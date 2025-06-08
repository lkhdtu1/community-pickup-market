-- Add producerId column to cart_items table
-- This migration adds the producer ID field to enable proper order creation

ALTER TABLE cart_items 
ADD COLUMN "producerId" varchar;

-- Update existing cart items to have a default producer ID if any exist
-- We'll set them to NULL first, then they can be updated by the sync process
UPDATE cart_items 
SET "producerId" = 'unknown' 
WHERE "producerId" IS NULL;

-- Add NOT NULL constraint after updating existing records (optional, for data integrity)
-- ALTER TABLE cart_items ALTER COLUMN "producerId" SET NOT NULL;

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
ORDER BY ordinal_position;
