import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HealthRecord {
  id: string;
  pet_id: string;
  type: 'vaccine' | 'deworming' | 'medication';
  name: string;
  date: string;
  next_due_date?: string;
  notes?: string;
  created_at: string;
}

export interface CreateHealthRecordInput {
  pet_id: string;
  type: 'vaccine' | 'deworming' | 'medication';
  name: string;
  date: string;
  next_due_date?: string;
  notes?: string;
}

export function useHealthRecords(petId: string | undefined) {
  return useQuery({
    queryKey: ['health-records', petId],
    queryFn: async () => {
      if (!petId) return [];
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('pet_id', petId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as HealthRecord[];
    },
    enabled: !!petId,
  });
}

export function useCreateHealthRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateHealthRecordInput) => {
      const { data, error } = await supabase
        .from('health_records')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data as HealthRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['health-records', data.pet_id] });
    },
  });
}

export function useDeleteHealthRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, petId }: { id: string; petId: string }) => {
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { petId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['health-records', data.petId] });
    },
  });
}
