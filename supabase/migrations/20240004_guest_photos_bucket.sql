-- Create guest-photos storage bucket (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guest-photos',
  'guest-photos',
  true,
  5242880,  -- 5 MB limit
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to upload photos
DROP POLICY IF EXISTS "auth users can upload guest photos" ON storage.objects;
CREATE POLICY "auth users can upload guest photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'guest-photos');

-- Allow authenticated users to update/replace their photos
DROP POLICY IF EXISTS "auth users can update guest photos" ON storage.objects;
CREATE POLICY "auth users can update guest photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'guest-photos');

-- Allow public read access
DROP POLICY IF EXISTS "public can read guest photos" ON storage.objects;
CREATE POLICY "public can read guest photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'guest-photos');

-- Allow authenticated users to delete their own photos
DROP POLICY IF EXISTS "auth users can delete guest photos" ON storage.objects;
CREATE POLICY "auth users can delete guest photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'guest-photos');
