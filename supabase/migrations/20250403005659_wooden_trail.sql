/*
  # Update tasks table and security policies

  1. Changes
    - Safely check for existing table and create if not exists
    - Ensure RLS is enabled
    - Update or create policies for CRUD operations
    - Add performance indexes

  2. Security
    - Enable RLS
    - Add policies for:
      - Reading own tasks
      - Creating tasks
      - Updating own tasks
      - Deleting own tasks
*/

-- Only create table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'tasks'
  ) THEN
    CREATE TABLE tasks (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz DEFAULT now(),
      title text NOT NULL,
      is_complete boolean DEFAULT false,
      user_id uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid()
    );
  END IF;
END $$;

-- Enable RLS (safe to run multiple times)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can read own tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
END $$;

-- Create or update policies
CREATE POLICY "Users can read own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'tasks' 
    AND indexname = 'tasks_user_id_idx'
  ) THEN
    CREATE INDEX tasks_user_id_idx ON tasks(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'tasks' 
    AND indexname = 'tasks_created_at_idx'
  ) THEN
    CREATE INDEX tasks_created_at_idx ON tasks(created_at);
  END IF;
END $$;