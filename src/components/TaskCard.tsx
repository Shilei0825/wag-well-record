import { useState } from 'react';
import { Check, Clock, MoreVertical, Trash2, Edit, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PetTask, useMarkTaskDone, useSnoozeTask, useDeleteTask } from '@/hooks/useTasks';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';

interface TaskCardProps {
  task: PetTask;
  onEdit?: (task: PetTask) => void;
}

const categoryColors: Record<string, string> = {
  health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  grooming: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  activity: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  training: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  admin: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const categoryLabels: Record<string, { zh: string; en: string }> = {
  health: { zh: '健康', en: 'Health' },
  grooming: { zh: '美容', en: 'Grooming' },
  activity: { zh: '活动', en: 'Activity' },
  training: { zh: '训练', en: 'Training' },
  admin: { zh: '管理', en: 'Admin' },
};

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { language } = useLanguage();
  const markDone = useMarkTaskDone();
  const snoozeTask = useSnoozeTask();
  const deleteTask = useDeleteTask();
  const [isLoading, setIsLoading] = useState(false);

  const dueDate = new Date(task.due_date);
  const isOverdue = isPast(dueDate) && !isToday(dueDate) && task.status === 'active';
  const isDone = task.status === 'done';
  const isCustomTask = !task.template_id;

  const getDueDateLabel = () => {
    if (isToday(dueDate)) return language === 'zh' ? '今天' : 'Today';
    if (isTomorrow(dueDate)) return language === 'zh' ? '明天' : 'Tomorrow';
    
    const daysFromNow = differenceInDays(dueDate, new Date());
    if (daysFromNow < 0) {
      return language === 'zh' ? `${Math.abs(daysFromNow)}天前` : `${Math.abs(daysFromNow)}d ago`;
    }
    if (daysFromNow <= 7) {
      return language === 'zh' ? `${daysFromNow}天后` : `in ${daysFromNow}d`;
    }
    return format(dueDate, 'MM/dd');
  };

  const handleMarkDone = async () => {
    setIsLoading(true);
    try {
      await markDone.mutateAsync(task);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnooze = async (days: number) => {
    setIsLoading(true);
    try {
      await snoozeTask.mutateAsync({ taskId: task.id, days, petId: task.pet_id });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteTask.mutateAsync({ taskId: task.id, petId: task.pet_id });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn(
      'transition-all',
      isDone && 'opacity-60',
      isOverdue && !isDone && 'border-destructive/50 bg-destructive/5'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Done checkbox */}
          <Button
            variant={isDone ? 'default' : 'outline'}
            size="icon"
            className={cn(
              'h-6 w-6 rounded-full shrink-0 mt-0.5',
              isDone && 'bg-primary'
            )}
            onClick={handleMarkDone}
            disabled={isLoading || isDone}
          >
            <Check className={cn('h-3.5 w-3.5', isDone ? 'text-primary-foreground' : 'text-muted-foreground')} />
          </Button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  'font-medium text-sm truncate',
                  isDone && 'line-through text-muted-foreground'
                )}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className={cn('text-xs', categoryColors[task.category])}>
                    {categoryLabels[task.category]?.[language] || task.category}
                  </Badge>
                  <span className={cn(
                    'text-xs flex items-center gap-1',
                    isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                  )}>
                    <Calendar className="h-3 w-3" />
                    {getDueDateLabel()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {!isDone && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSnooze(1)}>
                      <Clock className="h-4 w-4 mr-2" />
                      {language === 'zh' ? '推迟1天' : 'Snooze 1 day'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSnooze(3)}>
                      <Clock className="h-4 w-4 mr-2" />
                      {language === 'zh' ? '推迟3天' : 'Snooze 3 days'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSnooze(7)}>
                      <Clock className="h-4 w-4 mr-2" />
                      {language === 'zh' ? '推迟7天' : 'Snooze 7 days'}
                    </DropdownMenuItem>
                    {isCustomTask && onEdit && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {language === 'zh' ? '编辑' : 'Edit'}
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {language === 'zh' ? '删除' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
