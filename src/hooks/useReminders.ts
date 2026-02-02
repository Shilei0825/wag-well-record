import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Reminder {
  id: string;
  user_id: string;
  pet_id?: string;
  title: string;
  due_date: string;
  source_type?: 'health_record' | 'visit' | 'custom';
  source_id?: string;
  status: 'active' | 'done';
  created_at: string;
}

export interface CreateReminderInput {
  pet_id?: string;
  title: string;
  due_date: string;
  source_type?: 'health_record' | 'visit' | 'custom';
  source_id?: string;
}

export function useReminders() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['reminders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('reminders')
        .select('*, pets(name)')
        .eq('status', 'active')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (input: CreateReminderInput) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          ...input,
          user_id: user.id,
          status: 'active',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Reminder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useMarkReminderDone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'done' })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}
