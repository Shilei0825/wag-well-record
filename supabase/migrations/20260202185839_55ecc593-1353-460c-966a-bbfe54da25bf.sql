-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  language TEXT DEFAULT 'zh' CHECK (language IN ('zh', 'en')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat')),
  breed TEXT,
  sex TEXT CHECK (sex IN ('male', 'female', NULL)),
  birthdate DATE,
  weight NUMERIC(5,2),
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create health_records table
CREATE TABLE public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vaccine', 'deworming', 'medication')),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  next_due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create visits table
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  clinic_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  total_cost NUMERIC(10,2),
  invoice_photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN ('medical', 'food', 'supplies', 'other')),
  amount NUMERIC(10,2) NOT NULL,
  merchant TEXT,
  linked_visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create reminders table
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  source_type TEXT CHECK (source_type IN ('health_record', 'visit', 'custom')),
  source_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'done')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Pets policies
CREATE POLICY "Users can view own pets" ON public.pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pets" ON public.pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pets" ON public.pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pets" ON public.pets FOR DELETE USING (auth.uid() = user_id);

-- Health records policies (through pet ownership)
CREATE POLICY "Users can view own pet health records" ON public.health_records FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "Users can insert own pet health records" ON public.health_records FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "Users can update own pet health records" ON public.health_records FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "Users can delete own pet health records" ON public.health_records FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid()));

-- Visits policies (through pet ownership)
CREATE POLICY "Users can view own pet visits" ON public.visits FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = visits.pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "Users can insert own pet visits" ON public.visits FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = visits.pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "Users can update own pet visits" ON public.visits FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = visits.pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "Users can delete own pet visits" ON public.visits FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = visits.pet_id AND pets.user_id = auth.uid()));

-- Expenses policies (through pet ownership)
CREATE POLICY "Users can view own pet expenses" ON public.expenses FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = expenses.pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "Users can insert own pet expenses" ON public.expenses FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = expenses.pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "Users can update own pet expenses" ON public.expenses FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = expenses.pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "Users can delete own pet expenses" ON public.expenses FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = expenses.pet_id AND pets.user_id = auth.uid()));

-- Reminders policies
CREATE POLICY "Users can view own reminders" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON public.reminders FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone)
  VALUES (NEW.id, NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_pets_user_id ON public.pets(user_id);
CREATE INDEX idx_health_records_pet_id ON public.health_records(pet_id);
CREATE INDEX idx_visits_pet_id ON public.visits(pet_id);
CREATE INDEX idx_expenses_pet_id ON public.expenses(pet_id);
CREATE INDEX idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX idx_reminders_due_date ON public.reminders(due_date);