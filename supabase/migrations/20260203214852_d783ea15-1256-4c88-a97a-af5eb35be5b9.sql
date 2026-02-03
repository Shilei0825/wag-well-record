-- Create enums for task system
CREATE TYPE public.task_species AS ENUM ('dog', 'cat');
CREATE TYPE public.task_category AS ENUM ('health', 'grooming', 'activity', 'training', 'admin');
CREATE TYPE public.task_recurrence AS ENUM ('one_time', 'daily', 'weekly', 'monthly', 'interval_days');
CREATE TYPE public.task_status AS ENUM ('active', 'done');

-- Create task_templates table (global, read-only for users)
CREATE TABLE public.task_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  species task_species NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category task_category NOT NULL,
  recurrence_type task_recurrence NOT NULL DEFAULT 'one_time',
  interval_days INTEGER,
  default_due_offset_days INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_interval_days CHECK (
    (recurrence_type = 'interval_days' AND interval_days IS NOT NULL AND interval_days > 0) OR
    (recurrence_type != 'interval_days')
  )
);

-- Create pet_tasks table
CREATE TABLE public.pet_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.task_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category task_category NOT NULL,
  status task_status NOT NULL DEFAULT 'active',
  due_date DATE NOT NULL,
  recurrence_type task_recurrence NOT NULL DEFAULT 'one_time',
  interval_days INTEGER,
  last_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_task_interval_days CHECK (
    (recurrence_type = 'interval_days' AND interval_days IS NOT NULL AND interval_days > 0) OR
    (recurrence_type != 'interval_days')
  )
);

-- Enable RLS
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_templates (global read-only)
CREATE POLICY "Anyone can view active templates"
ON public.task_templates
FOR SELECT
USING (is_active = true);

-- RLS policies for pet_tasks (user-scoped via pet ownership)
CREATE POLICY "Users can view own pet tasks"
ON public.pet_tasks
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM pets
  WHERE pets.id = pet_tasks.pet_id AND pets.user_id = auth.uid()
));

CREATE POLICY "Users can insert own pet tasks"
ON public.pet_tasks
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM pets
    WHERE pets.id = pet_tasks.pet_id AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own pet tasks"
ON public.pet_tasks
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM pets
  WHERE pets.id = pet_tasks.pet_id AND pets.user_id = auth.uid()
));

CREATE POLICY "Users can delete own pet tasks"
ON public.pet_tasks
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM pets
  WHERE pets.id = pet_tasks.pet_id AND pets.user_id = auth.uid()
));

-- Indexes for performance
CREATE INDEX idx_pet_tasks_pet_id ON public.pet_tasks(pet_id);
CREATE INDEX idx_pet_tasks_user_id ON public.pet_tasks(user_id);
CREATE INDEX idx_pet_tasks_status ON public.pet_tasks(status);
CREATE INDEX idx_pet_tasks_due_date ON public.pet_tasks(due_date);
CREATE INDEX idx_task_templates_species ON public.task_templates(species);

-- Seed DOG templates
INSERT INTO public.task_templates (species, title, category, recurrence_type, interval_days, default_due_offset_days) VALUES
('dog', 'Daily walk', 'activity', 'daily', NULL, 0),
('dog', 'Basic training practice', 'training', 'weekly', NULL, 1),
('dog', 'Brush coat', 'grooming', 'weekly', NULL, 2),
('dog', 'Flea/tick prevention', 'health', 'interval_days', 30, 7),
('dog', 'Deworming reminder', 'health', 'interval_days', 90, 14),
('dog', 'Annual vaccination check', 'health', 'interval_days', 365, 30);

-- Seed CAT templates
INSERT INTO public.task_templates (species, title, category, recurrence_type, interval_days, default_due_offset_days) VALUES
('cat', 'Litter box cleaning', 'admin', 'daily', NULL, 0),
('cat', 'Play session', 'activity', 'daily', NULL, 0),
('cat', 'Brush coat', 'grooming', 'weekly', NULL, 2),
('cat', 'Flea/tick prevention', 'health', 'interval_days', 30, 7),
('cat', 'Deworming reminder', 'health', 'interval_days', 90, 14),
('cat', 'Annual vaccination check', 'health', 'interval_days', 365, 30);