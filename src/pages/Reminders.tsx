import { useNavigate } from 'react-router-dom';
import { Plus, Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReminders, useMarkReminderDone } from '@/hooks/useReminders';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { BottomNav } from '@/components/BottomNav';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Reminders() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: reminders, isLoading } = useReminders();
  const markDone = useMarkReminderDone();

  const formatDueDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return t('common.today');
    if (isTomorrow(date)) return language === 'zh' ? '明天' : 'Tomorrow';
    return format(date, 'MM/dd');
  };

  const handleMarkDone = async (id: string) => {
    try {
      await markDone.mutateAsync(id);
      toast.success(language === 'zh' ? '已完成' : 'Marked as done');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title={t('reminder.reminders')}
        showBack
        action={
          <Button
            size="icon"
            onClick={() => navigate('/reminder/new')}
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-center text-muted-foreground">{t('common.loading')}</p>
      ) : reminders && reminders.length > 0 ? (
        <div className="space-y-3">
          {reminders.map((reminder: any) => {
            const isOverdue = isPast(parseISO(reminder.due_date)) && !isToday(parseISO(reminder.due_date));
            
            return (
              <div
                key={reminder.id}
                className={cn(
                  'card-elevated p-4 flex items-center gap-4',
                  isOverdue && 'border-destructive/50'
                )}
              >
                <div className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center',
                  isOverdue ? 'bg-destructive/10' : 'bg-warning/10'
                )}>
                  <Bell className={cn(
                    'h-5 w-5',
                    isOverdue ? 'text-destructive' : 'text-warning'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{reminder.title}</p>
                  <p className={cn(
                    'text-sm',
                    isOverdue ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {reminder.pets?.name && `${reminder.pets.name} · `}
                    {formatDueDate(reminder.due_date)}
                    {isOverdue && ` · ${language === 'zh' ? '已过期' : 'Overdue'}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMarkDone(reminder.id)}
                  disabled={markDone.isPending}
                >
                  <Check className="h-5 w-5 text-success" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title={t('reminder.noReminders')}
          action={{
            label: t('reminder.add'),
            onClick: () => navigate('/reminder/new'),
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}
