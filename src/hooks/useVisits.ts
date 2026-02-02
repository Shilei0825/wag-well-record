import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Visit {
  id: string;
  pet_id: string;
  visit_date: string;
  clinic_name: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  total_cost?: number;
  invoice_photo_url?: string;
  notes?: string;
  created_at: string;
}

export interface CreateVisitInput {
  pet_id: string;
  visit_date: string;
  clinic_name: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  total_cost?: number;
  notes?: string;
}

export function useVisits(petId: string | undefined) {
  return useQuery({
    queryKey: ['visits', petId],
    queryFn: async () => {
      if (!petId) return [];
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('pet_id', petId)
        .order('visit_date', { ascending: false });
      
      if (error) throw error;
      return data as Visit[];
    },
    enabled: !!petId,
  });
}

export function useAllVisits() {
  return useQuery({
    queryKey: ['all-visits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('*, pets(name)')
        .order('visit_date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateVisitInput) => {
      const { data, error } = await supabase
        .from('visits')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data as Visit;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['visits', data.pet_id] });
      queryClient.invalidateQueries({ queryKey: ['all-visits'] });
    },
  });
}

export function useDeleteVisit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, petId }: { id: string; petId: string }) => {
      const { error } = await supabase
        .from('visits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { petId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['visits', data.petId] });
      queryClient.invalidateQueries({ queryKey: ['all-visits'] });
    },
  });
}
