-- Create pet_checkins table for daily check-ins with photos
CREATE TABLE public.pet_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pet_id, check_in_date)
);

-- Enable RLS
ALTER TABLE public.pet_checkins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own pet checkins" 
ON public.pet_checkins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pet checkins" 
ON public.pet_checkins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM pets WHERE pets.id = pet_id AND pets.user_id = auth.uid()
));

CREATE POLICY "Users can delete own pet checkins" 
ON public.pet_checkins 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create slideshows table
CREATE TABLE public.slideshows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  video_url TEXT,
  music_track TEXT NOT NULL DEFAULT 'happy',
  status TEXT NOT NULL DEFAULT 'pending',
  slideshow_type TEXT NOT NULL DEFAULT 'on_demand',
  date_range_start DATE,
  date_range_end DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.slideshows ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own slideshows" 
ON public.slideshows 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own slideshows" 
ON public.slideshows 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own slideshows" 
ON public.slideshows 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own slideshows" 
ON public.slideshows 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage bucket for check-in photos
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-checkins', 'pet-checkins', true);

-- Create storage policies for pet check-in photos
CREATE POLICY "Users can upload pet checkin photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'pet-checkins' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view pet checkin photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'pet-checkins');

CREATE POLICY "Users can delete own pet checkin photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'pet-checkins' AND auth.uid()::text = (storage.foldername(name))[1]);