/*
  # Add metadata fields to quotes table

  1. Changes
    - Add source field for quote attribution
    - Add link field for optional source URL
    - Add indexes for better query performance

  2. Security
    - Existing RLS policies will apply to new columns
*/

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS source text NOT NULL,
ADD COLUMN IF NOT EXISTS link text;

-- Add index for user_id and created_at for better performance
CREATE INDEX IF NOT EXISTS quotes_user_id_created_at_idx ON quotes (user_id, created_at);