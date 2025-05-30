CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  upload_id uuid REFERENCES uploads(id) NOT NULL,
  quote_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security if not already enabled
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can insert own quotes" ON quotes;

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