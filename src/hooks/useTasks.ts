import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type TaskCategory = 'health' | 'grooming' | 'activity' | 'training' | 'admin';
export type TaskRecurrence = 'one_time' | 'daily' | 'weekly' | 'monthly' | 'interval_days';
export type TaskStatus = 'active' | 'done';

export interface TaskTemplate {
  id: string;
  species: 'dog' | 'cat';
  title: string;
  description: string | null;
  category: TaskCategory;
  recurrence_type: TaskRecurrence;
  interval_days: number | null;
  default_due_offset_days: number;
  is_active: boolean;
  created_at: string;
}

export interface PetTask {
  id: string;
  user_id: string;
  pet_id: string;
  template_id: string | null;
  title: string;
  description: string | null;
  category: TaskCategory;
  status: TaskStatus;
  due_date: string;
  recurrence_type: TaskRecurrence;
  interval_days: number | null;
  last_completed_at: string | null;
  created_at: string;
}

export interface CreateTaskInput {
  pet_id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  due_date: string;
  recurrence_type: TaskRecurrence;
  interval_days?: number;
  template_id?: string;
}

// Get tasks for a specific pet
export function usePetTasks(petId: string | undefined) {
  return useQuery({
    queryKey: ['pet-tasks', petId],
    queryFn: async () => {
      if (!petId) return [];
      const { data, error } = await supabase
        .from('pet_tasks')
        .select('*')
        .eq('pet_id', petId)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data as PetTask[];
    },
    enabled: !!petId,
  });
}

// Get task templates for a species
export function useTaskTemplates(species: 'dog' | 'cat' | undefined) {
  return useQuery({
    queryKey: ['task-templates', species],
    queryFn: async () => {
      if (!species) return [];
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .eq('species', species)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as TaskTemplate[];
    },
    enabled: !!species,
  });
}

// Initialize default tasks for a pet (idempotent)
export function useInitializePetTasks() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ petId, species }: { petId: string; species: 'dog' | 'cat' }) => {
      if (!user) throw new Error('Not authenticated');

      // Check if pet already has tasks
      const { data: existingTasks, error: checkError } = await supabase
        .from('pet_tasks')
        .select('id')
        .eq('pet_id', petId)
        .limit(1);

      if (checkError) throw checkError;
      
      // If tasks already exist, skip initialization
      if (existingTasks && existingTasks.length > 0) {
        return { initialized: false, message: 'Tasks already exist' };
      }

      // Get templates for the species
      const { data: templates, error: templateError } = await supabase
        .from('task_templates')
        .select('*')
        .eq('species', species)
        .eq('is_active', true);

      if (templateError) throw templateError;

      if (!templates || templates.length === 0) {
        return { initialized: false, message: 'No templates found' };
      }

      // Create tasks from templates
      const today = new Date();
      const tasksToInsert = templates.map((template: TaskTemplate) => {
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + template.default_due_offset_days);
        
        return {
          user_id: user.id,
          pet_id: petId,
          template_id: template.id,
          title: template.title,
          description: template.description,
          category: template.category,
          status: 'active' as TaskStatus,
          due_date: dueDate.toISOString().split('T')[0],
          recurrence_type: template.recurrence_type,
          interval_days: template.interval_days,
        };
      });

      const { error: insertError } = await supabase
        .from('pet_tasks')
        .insert(tasksToInsert);

      if (insertError) throw insertError;

      return { initialized: true, message: 'Tasks initialized successfully' };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pet-tasks', variables.petId] });
    },
  });
}

// Create a custom task
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pet_tasks')
        .insert({
          user_id: user.id,
          pet_id: input.pet_id,
          template_id: input.template_id || null,
          title: input.title,
          description: input.description || null,
          category: input.category,
          status: 'active',
          due_date: input.due_date,
          recurrence_type: input.recurrence_type,
          interval_days: input.interval_days || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PetTask;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pet-tasks', data.pet_id] });
    },
  });
}

// Mark task as done (and create next occurrence for recurring tasks)
export function useMarkTaskDone() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (task: PetTask) => {
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      
      // Update current task to done
      const { error: updateError } = await supabase
        .from('pet_tasks')
        .update({
          status: 'done',
          last_completed_at: now.toISOString(),
        })
        .eq('id', task.id);

      if (updateError) throw updateError;

      // Create next occurrence for recurring tasks
      if (task.recurrence_type !== 'one_time') {
        const today = new Date();
        let nextDueDate = new Date(today);

        switch (task.recurrence_type) {
          case 'daily':
            nextDueDate.setDate(nextDueDate.getDate() + 1);
            break;
          case 'weekly':
            nextDueDate.setDate(nextDueDate.getDate() + 7);
            break;
          case 'monthly':
            nextDueDate.setDate(nextDueDate.getDate() + 30);
            break;
          case 'interval_days':
            if (task.interval_days) {
              nextDueDate.setDate(nextDueDate.getDate() + task.interval_days);
            }
            break;
        }

        const { error: insertError } = await supabase
          .from('pet_tasks')
          .insert({
            user_id: user.id,
            pet_id: task.pet_id,
            template_id: task.template_id,
            title: task.title,
            description: task.description,
            category: task.category,
            status: 'active',
            due_date: nextDueDate.toISOString().split('T')[0],
            recurrence_type: task.recurrence_type,
            interval_days: task.interval_days,
          });

        if (insertError) throw insertError;
      }

      return { success: true };
    },
    onSuccess: (_, task) => {
      queryClient.invalidateQueries({ queryKey: ['pet-tasks', task.pet_id] });
    },
  });
}

// Snooze a task
export function useSnoozeTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, days, petId }: { taskId: string; days: number; petId: string }) => {
      const { data: task, error: fetchError } = await supabase
        .from('pet_tasks')
        .select('due_date')
        .eq('id', taskId)
        .single();

      if (fetchError) throw fetchError;

      const currentDue = new Date(task.due_date);
      currentDue.setDate(currentDue.getDate() + days);

      const { error } = await supabase
        .from('pet_tasks')
        .update({ due_date: currentDue.toISOString().split('T')[0] })
        .eq('id', taskId);

      if (error) throw error;
      return { success: true, petId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['pet-tasks', result.petId] });
    },
  });
}

// Update a task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, petId, ...updates }: Partial<PetTask> & { id: string; petId: string }) => {
      const { data, error } = await supabase
        .from('pet_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, petId } as PetTask & { petId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pet-tasks', data.petId] });
    },
  });
}

// Delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, petId }: { taskId: string; petId: string }) => {
      const { error } = await supabase
        .from('pet_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return { petId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['pet-tasks', result.petId] });
    },
  });
}
