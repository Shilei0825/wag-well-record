import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CheckIn {
  id: string;
  user_id: string;
  pet_id: string;
  photo_url: string;
  check_in_date: string;
  created_at: string;
}

export function useCheckIns(petId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['checkins', user?.id, petId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('pet_checkins')
        .select('*')
        .order('check_in_date', { ascending: false });
      
      if (petId) {
        query = query.eq('pet_id', petId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as CheckIn[];
    },
    enabled: !!user,
  });
}

export function useMonthlyCheckIns(year: number, month: number, petId?: string) {
  const { user } = useAuth();
  
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['checkins', user?.id, petId, year, month],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('pet_checkins')
        .select('*')
        .gte('check_in_date', startDate)
        .lte('check_in_date', endDate)
        .order('check_in_date', { ascending: true });
      
      if (petId) {
        query = query.eq('pet_id', petId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as CheckIn[];
    },
    enabled: !!user,
  });
}

export function useTodayCheckIn(petId: string) {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['checkin-today', user?.id, petId, today],
    queryFn: async () => {
      if (!user || !petId) return null;
      
      const { data, error } = await supabase
        .from('pet_checkins')
        .select('*')
        .eq('pet_id', petId)
        .eq('check_in_date', today)
        .maybeSingle();
      
      if (error) throw error;
      return data as CheckIn | null;
    },
    enabled: !!user && !!petId,
  });
}

export function useCreateCheckIn() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ petId, photoFile }: { petId: string; photoFile: File }) => {
      if (!user) throw new Error('Not authenticated');
      
      const today = new Date().toISOString().split('T')[0];
      const fileName = `${user.id}/${petId}/${today}-${Date.now()}.jpg`;
      
      // Upload photo
      const { error: uploadError } = await supabase.storage
        .from('pet-checkins')
        .upload(fileName, photoFile);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('pet-checkins')
        .getPublicUrl(fileName);
      
      // Create check-in record
      const { data, error } = await supabase
        .from('pet_checkins')
        .insert({
          user_id: user.id,
          pet_id: petId,
          photo_url: urlData.publicUrl,
          check_in_date: today,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as CheckIn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
      queryClient.invalidateQueries({ queryKey: ['checkin-today'] });
    },
  });
}

export function useDeleteCheckIn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (checkInId: string) => {
      const { error } = await supabase
        .from('pet_checkins')
        .delete()
        .eq('id', checkInId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
      queryClient.invalidateQueries({ queryKey: ['checkin-today'] });
      queryClient.invalidateQueries({ queryKey: ['checkin-streak'] });
    },
  });
}

export function useCheckInStreak(petId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['checkin-streak', user?.id, petId],
    queryFn: async () => {
      if (!user) return 0;
      
      let query = supabase
        .from('pet_checkins')
        .select('check_in_date')
        .order('check_in_date', { ascending: false });
      
      if (petId) {
        query = query.eq('pet_id', petId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      if (!data || data.length === 0) return 0;
      
      // Calculate streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dates = data.map(d => new Date(d.check_in_date));
      
      for (let i = 0; i < dates.length; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);
        
        const checkInDate = new Date(dates[i]);
        checkInDate.setHours(0, 0, 0, 0);
        
        if (checkInDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else if (i === 0 && checkInDate.getTime() < expectedDate.getTime()) {
          // First day not checked in today, check if yesterday was
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);
          
          if (checkInDate.getTime() === yesterday.getTime()) {
            streak = 1;
            continue;
          }
          break;
        } else {
          break;
        }
      }
      
      return streak;
    },
    enabled: !!user,
  });
}
