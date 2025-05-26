/*
  # Add quotes table

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

CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  upload_id uuid REFERENCES uploads(id) NOT NULL,
  quote_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own quotes"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());