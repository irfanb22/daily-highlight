/*
  # Add user preferences and email settings

  1. New Tables
    - `user_preferences`
      - `user_id` (uuid, foreign key to auth.users)
      - `delivery_time` (time)
      - `timezone` (text)
      - `frequency` (email_frequency enum)
      - `custom_days` (integer array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on user_preferences table
    - Add policies for authenticated users to manage their preferences
*/

-- Create email_frequency enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE email_frequency AS ENUM ('daily', 'weekdays', 'custom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  delivery_time time without time zone NOT NULL DEFAULT '09:00:00',
  timezone text NOT NULL DEFAULT 'UTC',
  frequency email_frequency NOT NULL DEFAULT 'daily',
  custom_days integer[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();