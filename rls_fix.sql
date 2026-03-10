-- SocialSpark: RLS Fixes for Storage and Posts

-- 1. Create storage policies for the 'posts' bucket
-- These allow authenticated users to upload their images and anyone to view them

CREATE POLICY "Give public access to posts images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'posts' );

CREATE POLICY "Allow authenticated users to upload posts images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to update their own posts images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'posts' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to delete their own posts images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posts' AND
  auth.role() = 'authenticated'
);

-- 2. Create identical storage policies for the 'avatars' bucket

CREATE POLICY "Give public access to avatars images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Allow authenticated users to upload avatars images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to update their own avatars images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to delete their own avatars images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);
