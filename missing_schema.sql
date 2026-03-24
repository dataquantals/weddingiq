-- Supabase Schema Initialization for WeddingIQ
-- Run this in your Supabase SQL Editor

-- 1. Create the `weddings` table
CREATE TABLE IF NOT EXISTS weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bride TEXT,
  groom TEXT,
  date DATE,
  venue TEXT,
  hosts TEXT,
  address TEXT,
  lat FLOAT,
  lng FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id)
);

-- 2. Create the `designs` table
CREATE TABLE IF NOT EXISTS designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  theme TEXT,
  "bgImage" TEXT,
  components JSONB,
  colors JSONB,
  "qrTemplate" JSONB,
  history JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Modify the `guests` table from README.md to ensure it has all required columns
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL, 
  email TEXT, 
  phone TEXT,
  table_number INT, 
  plus_ones INT DEFAULT 0,
  checked_in BOOLEAN DEFAULT FALSE, 
  checked_in_at TIMESTAMPTZ,
  rsvp_status TEXT DEFAULT 'pending', 
  ai_message TEXT,
  qr_token TEXT UNIQUE DEFAULT gen_random_uuid(),
  photo_url TEXT, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: if you previously ran the README.md SQL, you can use these commands to add missing columns:
ALTER TABLE guests ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE;

-- 4. Set up Row Level Security (RLS) policies 
--    (For full security in production, replace checking "true" with proper auth.uid() checks)
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON weddings FOR ALL USING (true);

ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON designs FOR ALL USING (true);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all guests" ON guests FOR ALL USING (true);

-- Be sure to click "Reload Schema" on your API Settings dashboard after running this if using PostgREST!
