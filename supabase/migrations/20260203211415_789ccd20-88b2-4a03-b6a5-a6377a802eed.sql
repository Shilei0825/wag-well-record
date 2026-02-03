-- Create storage bucket for pet avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-avatars', 'pet-avatars', true);

-- Allow authenticated users to upload their own pet avatars
CREATE POLICY "Users can upload pet avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pet-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own pet avatars
CREATE POLICY "Users can update own pet avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pet-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own pet avatars
CREATE POLICY "Users can delete own pet avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pet-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to pet avatars (since bucket is public)
CREATE POLICY "Pet avatars are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pet-avatars');