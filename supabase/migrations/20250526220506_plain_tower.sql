/*
  # Create quotes table

  1. New Tables
    - `quotes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `upload_id` (uuid, foreign key to uploads.id)
      - `quote_text` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on quotes table
    - Add policies for authenticated users to read and insert their own quotes
*/

-- Create quotes table if it doesn't exist
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  upload_id uuid REFERENCES uploads(id) NOT NULL,
  quote_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quotes' 
    AND policyname = 'Users can read own quotes'
  ) THEN
    CREATE POLICY "Users can read own quotes"
      ON quotes
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quotes' 
    AND policyname = 'Users can insert own quotes'
  ) THEN
    CREATE POLICY "Users can insert own quotes"
      ON quotes
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;