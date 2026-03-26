-- Fix guests table so that guests properly save to Supabase
-- Run this in your Supabase SQL Editor

-- 1. Ensure the guests table exists
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL, 
  email TEXT, 
  phone TEXT,
  table_number TEXT,  -- Changed to TEXT to prevent empty string integer constraint errors
  plus_ones INT DEFAULT 0,
  checked_in BOOLEAN DEFAULT FALSE, 
  checked_in_at TIMESTAMPTZ,
  rsvp_status TEXT DEFAULT 'pending', 
  ai_message TEXT,
  qr_token TEXT UNIQUE DEFAULT gen_random_uuid(),
  photo_url TEXT, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. If the table already existed, ensure the table_number column is a TEXT type, not an INT
-- (Empty strings from the frontend cast to INT will fail violently, creating the "doesn't save" bug)
ALTER TABLE public.guests ALTER COLUMN table_number TYPE TEXT USING table_number::text;

-- 3. Ensure the wedding_id exists and can correctly scope projects
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE;

-- 4. Enable RLS and setup permissive policy so inserts actually work
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'guests' AND policyname = 'Allow all guests'
  ) THEN
    CREATE POLICY "Allow all guests" ON public.guests FOR ALL USING (true);
  END IF;
END$$;
