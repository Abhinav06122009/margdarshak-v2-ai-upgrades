
-- Add the missing folder and is_highlighted columns to the notes table
ALTER TABLE public.notes 
ADD COLUMN folder text,
ADD COLUMN is_highlighted boolean DEFAULT false;
