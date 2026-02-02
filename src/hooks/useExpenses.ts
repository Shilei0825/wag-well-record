import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Expense {
  id: string;
  pet_id: string;
  date: string;
  category: 'medical' | 'food' | 'supplies' | 'other';
  amount: number;
  merchant?: string;
  linked_visit_id?: string;
  notes?: string;
  created_at: string;
}

export interface CreateExpenseInput {
  pet_id: string;
  date: string;
  category: 'medical' | 'food' | 'supplies' | 'other';
  amount: number;
  merchant?: string;
  linked_visit_id?: string;
  notes?: string;
}

export function useExpenses(petId: string | undefined) {
  return useQuery({
    queryKey: ['expenses', petId],
    queryFn: async () => {
      if (!petId) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('pet_id', petId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!petId,
  });
}

export function useAllExpenses() {
  return useQuery({
    queryKey: ['all-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, pets(name)')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data as Expense;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', data.pet_id] });
      queryClient.invalidateQueries({ queryKey: ['all-expenses'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, petId }: { id: string; petId: string }) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { petId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', data.petId] });
      queryClient.invalidateQueries({ queryKey: ['all-expenses'] });
    },
  });
}
