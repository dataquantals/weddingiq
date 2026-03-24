-- Add missing columns to support full WeddingIQ persistence
-- Run this in Supabase SQL Editor → Database → SQL Editor

-- 0. Add 'wedding_id' to guests table (CRITICAL: enables per-project guest scoping)
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_guests_wedding_id ON public.guests(wedding_id);

-- 1. Add the 'design' JSONB column to designs table (stores card copy: headline, personal_note, etc.)
ALTER TABLE public.designs ADD COLUMN IF NOT EXISTS design JSONB;

-- 2. Add 'bgImage' text column to designs if not present (some installs use "bgImage" quoted)
ALTER TABLE public.designs ADD COLUMN IF NOT EXISTS "bgImage" TEXT;

-- 3. Add 'venues' JSONB to weddings table (ceremony + reception venue data)
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS venues JSONB;

-- 4. Add 'wedding_id' to designs for per-project design isolation
ALTER TABLE public.designs ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE;

-- 5. Ensure card_canvas table exists (if migration 20240001 was not run)
CREATE TABLE IF NOT EXISTS public.card_canvas (
  user_id         TEXT        NOT NULL,
  wedding_id      TEXT        NOT NULL DEFAULT 'default',
  canvas_pages    JSONB       NOT NULL DEFAULT '[]'::jsonb,
  selected_border JSONB       NULL,
  border_category TEXT        NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, wedding_id)
);

ALTER TABLE public.card_canvas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'card_canvas' AND policyname = 'card_canvas_owner'
  ) THEN
    CREATE POLICY "card_canvas_owner" ON public.card_canvas
      USING  (user_id = auth.uid()::text)
      WITH CHECK (user_id = auth.uid()::text);
  END IF;
END$$;
