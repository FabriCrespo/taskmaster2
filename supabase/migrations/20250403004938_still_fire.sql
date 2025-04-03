/*
  # Create tasks table and security policies

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `title` (text)
      - `is_complete` (boolean)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for CRUD operations:
      - Users can read their own tasks
      - Users can insert tasks (user_id is automatically set)
      - Users can update their own tasks
      - Users can delete their own tasks
*/

-- Create tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  is_complete boolean DEFAULT false,
  user_id uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create index for better query performance
CREATE INDEX tasks_user_id_idx ON tasks(user_id);
CREATE INDEX tasks_created_at_idx ON tasks(created_at);