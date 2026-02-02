-- Create table for AI Vet consultations
CREATE TABLE public.ai_vet_consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Intake data
  main_symptom TEXT NOT NULL,
  duration TEXT NOT NULL,
  severity TEXT NOT NULL,
  additional_symptoms TEXT[] DEFAULT '{}',
  additional_notes TEXT,
  
  -- AI response summary
  urgency_level TEXT,
  summary TEXT,
  full_response TEXT
);

-- Enable RLS
ALTER TABLE public.ai_vet_consultations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own consultations"
ON public.ai_vet_consultations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consultations"
ON public.ai_vet_consultations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own consultations"
ON public.ai_vet_consultations
FOR DELETE
USING (auth.uid() = user_id);