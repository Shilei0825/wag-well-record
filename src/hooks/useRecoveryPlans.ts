import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type RecoverySourceType = 'ai_consult' | 'vet_visit';
export type RecoverySeverity = 'mild' | 'moderate';
export type RecoveryStatus = 'active' | 'completed';
export type AppetiteLevel = 'normal' | 'reduced' | 'poor';
export type EnergyLevel = 'normal' | 'low' | 'very_low';
export type SymptomStatus = 'improved' | 'same' | 'worse';

export interface RecoveryPlan {
  id: string;
  user_id: string;
  pet_id: string;
  source_type: RecoverySourceType;
  source_id: string | null;
  main_symptom: string;
  severity_level: RecoverySeverity;
  duration_days: number;
  status: RecoveryStatus;
  ai_summary: string | null;
  recovery_trend: string | null;
  suggestion: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface RecoveryCheckin {
  id: string;
  plan_id: string;
  day_index: number;
  appetite: AppetiteLevel;
  energy: EnergyLevel;
  symptom_status: SymptomStatus;
  notes: string | null;
  created_at: string;
}

export interface CreateRecoveryPlanData {
  pet_id: string;
  source_type: RecoverySourceType;
  source_id?: string;
  main_symptom: string;
  severity_level?: RecoverySeverity;
  duration_days?: number;
}

export interface CreateRecoveryCheckinData {
  plan_id: string;
  day_index: number;
  appetite: AppetiteLevel;
  energy: EnergyLevel;
  symptom_status: SymptomStatus;
  notes?: string;
}

export function useRecoveryPlans(petId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recovery-plans', petId],
    queryFn: async () => {
      let query = supabase
        .from('recovery_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (petId) {
        query = query.eq('pet_id', petId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RecoveryPlan[];
    },
    enabled: !!user,
  });
}

export function useActiveRecoveryPlan(petId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['active-recovery-plan', petId],
    queryFn: async () => {
      let query = supabase
        .from('recovery_plans')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (petId) {
        query = query.eq('pet_id', petId);
      }

      const { data, error } = await query.limit(1).maybeSingle();
      if (error) throw error;
      return data as RecoveryPlan | null;
    },
    enabled: !!user,
  });
}

export function useRecoveryPlan(planId: string) {
  return useQuery({
    queryKey: ['recovery-plan', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recovery_plans')
        .select('*')
        .eq('id', planId)
        .maybeSingle();

      if (error) throw error;
      return data as RecoveryPlan | null;
    },
    enabled: !!planId,
  });
}

export function useRecoveryCheckins(planId: string) {
  return useQuery({
    queryKey: ['recovery-checkins', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recovery_checkins')
        .select('*')
        .eq('plan_id', planId)
        .order('day_index', { ascending: true });

      if (error) throw error;
      return data as RecoveryCheckin[];
    },
    enabled: !!planId,
  });
}

export function useCreateRecoveryPlan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateRecoveryPlanData) => {
      if (!user) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('recovery_plans')
        .insert({
          user_id: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return result as RecoveryPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recovery-plans'] });
      queryClient.invalidateQueries({ queryKey: ['active-recovery-plan'] });
    },
  });
}

export function useCreateRecoveryCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRecoveryCheckinData) => {
      const { data: result, error } = await supabase
        .from('recovery_checkins')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as RecoveryCheckin;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recovery-checkins', variables.plan_id] });
      queryClient.invalidateQueries({ queryKey: ['recovery-plans'] });
      queryClient.invalidateQueries({ queryKey: ['active-recovery-plan'] });
    },
  });
}

export function useUpdateRecoveryPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<RecoveryPlan> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('recovery_plans')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as RecoveryPlan;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recovery-plans'] });
      queryClient.invalidateQueries({ queryKey: ['recovery-plan', data.id] });
      queryClient.invalidateQueries({ queryKey: ['active-recovery-plan'] });
    },
  });
}
