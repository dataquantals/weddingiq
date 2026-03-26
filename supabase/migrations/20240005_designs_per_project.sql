-- 1. Add wedding_id column if missing
ALTER TABLE public.designs
  ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE;

-- 2. Drop the old single-column unique constraint (blocks per-project isolation)
DO $$
DECLARE
  cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'public.designs'::regclass
    AND contype = 'u'
    AND array_length(conkey, 1) = 1
    AND conkey[1] = (
      SELECT attnum FROM pg_attribute
      WHERE attrelid = 'public.designs'::regclass AND attname = 'user_id'
    );
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.designs DROP CONSTRAINT %I', cname);
  END IF;
END$$;

-- 3. Add composite unique so each project gets its own design row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'designs_user_id_wedding_id_key'
      AND conrelid = 'public.designs'::regclass
  ) THEN
    ALTER TABLE public.designs
      ADD CONSTRAINT designs_user_id_wedding_id_key UNIQUE (user_id, wedding_id);
  END IF;
END$$;
