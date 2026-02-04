-- Create enums for recovery feature
CREATE TYPE public.recovery_source_type AS ENUM ('ai_consult', 'vet_visit');
CREATE TYPE public.recovery_severity AS ENUM ('mild', 'moderate');
CREATE TYPE public.recovery_status AS ENUM ('active', 'completed');
CREATE TYPE public.appetite_level AS ENUM ('normal', 'reduced', 'poor');
CREATE TYPE public.energy_level AS ENUM ('normal', 'low', 'very_low');
CREATE TYPE public.symptom_status AS ENUM ('improved', 'same', 'worse');

-- Create recovery_plans table
CREATE TABLE public.recovery_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  source_type recovery_source_type NOT NULL,
  source_id UUID,
  main_symptom TEXT NOT NULL,
  severity_level recovery_severity NOT NULL DEFAULT 'mild',
  duration_days INTEGER NOT NULL DEFAULT 3,
  status recovery_status NOT NULL DEFAULT 'active',
  ai_summary TEXT,
  recovery_trend TEXT,
  suggestion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create recovery_checkins table
CREATE TABLE public.recovery_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.recovery_plans(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL,
  appetite appetite_level NOT NULL,
  energy energy_level NOT NULL,
  symptom_status symptom_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(plan_id, day_index)
);

-- Enable RLS
ALTER TABLE public.recovery_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_checkins ENABLE ROW LEVEL SECURITY;

-- RLS policies for recovery_plans
CREATE POLICY "Users can view own recovery plans"
ON public.recovery_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recovery plans"
ON public.recovery_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recovery plans"
ON public.recovery_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recovery plans"
ON public.recovery_plans FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for recovery_checkins (through plan ownership)
CREATE POLICY "Users can view own recovery checkins"
ON public.recovery_checkins FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.recovery_plans
  WHERE recovery_plans.id = recovery_checkins.plan_id
  AND recovery_plans.user_id = auth.uid()
));

CREATE POLICY "Users can insert own recovery checkins"
ON public.recovery_checkins FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.recovery_plans
  WHERE recovery_plans.id = recovery_checkins.plan_id
  AND recovery_plans.user_id = auth.uid()
));

CREATE POLICY "Users can update own recovery checkins"
ON public.recovery_checkins FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.recovery_plans
  WHERE recovery_plans.id = recovery_checkins.plan_id
  AND recovery_plans.user_id = auth.uid()
));

CREATE POLICY "Users can delete own recovery checkins"
ON public.recovery_checkins FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.recovery_plans
  WHERE recovery_plans.id = recovery_checkins.plan_id
  AND recovery_plans.user_id = auth.uid()
));