-- Copy and paste this SQL into Supabase SQL Editor

-- Create progress_goals table
CREATE TABLE IF NOT EXISTS progress_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  target_value DECIMAL NOT NULL,
  current_value DECIMAL DEFAULT 0,
  unit TEXT NOT NULL,
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress_entries table
CREATE TABLE IF NOT EXISTS progress_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES progress_goals(id) ON DELETE CASCADE,
  value DECIMAL NOT NULL,
  notes TEXT,
  date_recorded DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE progress_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for progress_goals
DROP POLICY IF EXISTS "Enable read access for authenticated users on progress_goals" ON progress_goals;
DROP POLICY IF EXISTS "Enable insert access for authenticated users on progress_goals" ON progress_goals;
DROP POLICY IF EXISTS "Enable update access for authenticated users on progress_goals" ON progress_goals;
DROP POLICY IF EXISTS "Enable delete access for authenticated users on progress_goals" ON progress_goals;

-- Create enhanced policies for progress_goals
CREATE POLICY "Enable read access for authenticated users on progress_goals" 
ON progress_goals FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for authenticated users on progress_goals" 
ON progress_goals FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for authenticated users on progress_goals" 
ON progress_goals FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for authenticated users on progress_goals" 
ON progress_goals FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Drop existing policies for progress_entries
DROP POLICY IF EXISTS "Enable read access for authenticated users on progress_entries" ON progress_entries;
DROP POLICY IF EXISTS "Enable insert access for authenticated users on progress_entries" ON progress_entries;
DROP POLICY IF EXISTS "Enable update access for authenticated users on progress_entries" ON progress_entries;
DROP POLICY IF EXISTS "Enable delete access for authenticated users on progress_entries" ON progress_entries;

-- Create enhanced policies for progress_entries
CREATE POLICY "Enable read access for authenticated users on progress_entries" 
ON progress_entries FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for authenticated users on progress_entries" 
ON progress_entries FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for authenticated users on progress_entries" 
ON progress_entries FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for authenticated users on progress_entries" 
ON progress_entries FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_progress_goals_user_id ON progress_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_goals_status ON progress_goals(status);
CREATE INDEX IF NOT EXISTS idx_progress_entries_user_id ON progress_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_goal_id ON progress_entries(goal_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_date ON progress_entries(date_recorded);