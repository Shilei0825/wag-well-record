import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: 'dog' | 'cat';
  breed?: string;
  sex?: 'male' | 'female';
  birthdate?: string;
  weight?: number;
  avatar_url?: string;
  notes?: string;
  created_at: string;
}

export interface CreatePetInput {
  name: string;
  species: 'dog' | 'cat';
  breed?: string;
  sex?: 'male' | 'female';
  birthdate?: string;
  weight?: number;
  notes?: string;
}

export function usePets() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['pets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Pet[];
    },
    enabled: !!user,
  });
}

export function usePet(petId: string | undefined) {
  return useQuery({
    queryKey: ['pet', petId],
    queryFn: async () => {
      if (!petId) return null;
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();
      
      if (error) throw error;
      return data as Pet;
    },
    enabled: !!petId,
  });
}

export function useCreatePet() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (input: CreatePetInput) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('pets')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Pet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Pet> & { id: string }) => {
      const { data, error } = await supabase
        .from('pets')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Pet;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pet', data.id] });
    },
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (petId: string) => {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
}
