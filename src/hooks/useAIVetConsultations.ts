import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AIVetConsultation {
  id: string;
  user_id: string;
  pet_id: string;
  created_at: string;
  main_symptom: string;
  duration: string;
  severity: string;
  additional_symptoms: string[];
  additional_notes: string | null;
  urgency_level: string | null;
  summary: string | null;
  full_response: string | null;
}

export interface CreateConsultationData {
  pet_id: string;
  main_symptom: string;
  duration: string;
  severity: string;
  additional_symptoms?: string[];
  additional_notes?: string;
  urgency_level?: string;
  summary?: string;
  full_response?: string;
}

export function useAIVetConsultations(petId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-vet-consultations', petId],
    queryFn: async () => {
      let query = supabase
        .from('ai_vet_consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (petId) {
        query = query.eq('pet_id', petId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AIVetConsultation[];
    },
    enabled: !!user,
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateConsultationData) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data: result, error } = await supabase
        .from('ai_vet_consultations')
        .insert({
          user_id: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-vet-consultations'] });
    },
  });
}

export function useDeleteConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_vet_consultations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-vet-consultations'] });
    },
  });
}
