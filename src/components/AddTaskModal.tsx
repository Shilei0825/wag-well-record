import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateTask, useUpdateTask, TaskCategory, TaskRecurrence, PetTask } from '@/hooks/useTasks';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  category: z.enum(['health', 'grooming', 'activity', 'training', 'admin']),
  due_date: z.string().min(1, 'Due date is required'),
  recurrence_type: z.enum(['one_time', 'daily', 'weekly', 'monthly', 'interval_days']),
  interval_days: z.number().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
  editTask?: PetTask | null;
}

const categoryOptions: { value: TaskCategory; labelZh: string; labelEn: string }[] = [
  { value: 'health', labelZh: '健康', labelEn: 'Health' },
  { value: 'grooming', labelZh: '美容', labelEn: 'Grooming' },
  { value: 'activity', labelZh: '活动', labelEn: 'Activity' },
  { value: 'training', labelZh: '训练', labelEn: 'Training' },
  { value: 'admin', labelZh: '管理', labelEn: 'Admin' },
];

const recurrenceOptions: { value: TaskRecurrence; labelZh: string; labelEn: string }[] = [
  { value: 'one_time', labelZh: '一次性', labelEn: 'One time' },
  { value: 'daily', labelZh: '每天', labelEn: 'Daily' },
  { value: 'weekly', labelZh: '每周', labelEn: 'Weekly' },
  { value: 'monthly', labelZh: '每月', labelEn: 'Monthly' },
  { value: 'interval_days', labelZh: '自定义天数', labelEn: 'Custom interval' },
];

export function AddTaskModal({ open, onOpenChange, petId, editTask }: AddTaskModalProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editTask;

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: editTask?.title || '',
      category: editTask?.category || 'health',
      due_date: editTask?.due_date || new Date().toISOString().split('T')[0],
      recurrence_type: editTask?.recurrence_type || 'one_time',
      interval_days: editTask?.interval_days || undefined,
    },
  });

  const watchRecurrence = form.watch('recurrence_type');

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing && editTask) {
        await updateTask.mutateAsync({
          id: editTask.id,
          petId,
          title: data.title,
          category: data.category,
          due_date: data.due_date,
          recurrence_type: data.recurrence_type,
          interval_days: data.recurrence_type === 'interval_days' ? data.interval_days : null,
        });
        toast({
          title: language === 'zh' ? '任务已更新' : 'Task updated',
        });
      } else {
        await createTask.mutateAsync({
          pet_id: petId,
          title: data.title,
          category: data.category,
          due_date: data.due_date,
          recurrence_type: data.recurrence_type,
          interval_days: data.recurrence_type === 'interval_days' ? data.interval_days : undefined,
        });
        toast({
          title: language === 'zh' ? '任务已添加' : 'Task added',
        });
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: language === 'zh' ? '操作失败' : 'Operation failed',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? (language === 'zh' ? '编辑任务' : 'Edit Task')
              : (language === 'zh' ? '添加任务' : 'Add Task')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'zh' ? '任务名称' : 'Task Title'}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={language === 'zh' ? '输入任务名称' : 'Enter task title'} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'zh' ? '类别' : 'Category'}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {language === 'zh' ? option.labelZh : option.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'zh' ? '截止日期' : 'Due Date'}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurrence_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'zh' ? '重复' : 'Recurrence'}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {recurrenceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {language === 'zh' ? option.labelZh : option.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchRecurrence === 'interval_days' && (
              <FormField
                control={form.control}
                name="interval_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'zh' ? '间隔天数' : 'Interval (days)'}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting
                  ? (language === 'zh' ? '保存中...' : 'Saving...')
                  : (language === 'zh' ? '保存' : 'Save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
