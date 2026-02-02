import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Stethoscope, Receipt, Bell, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePets, Pet } from '@/hooks/usePets';
import { useReminders } from '@/hooks/useReminders';
import { PetSelector } from '@/components/PetSelector';
import { EmptyState } from '@/components/EmptyState';
import { BottomNav } from '@/components/BottomNav';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: pets, isLoading: petsLoading } = usePets();
  const { data: reminders } = useReminders();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  useEffect(() => {
    if (pets && pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0]);
    }
  }, [pets, selectedPet]);

  const formatDueDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return t('common.today');
    if (isTomorrow(date)) return language === 'zh' ? '明天' : 'Tomorrow';
    return format(date, 'MM/dd');
  };

  const upcomingReminders = reminders?.slice(0, 3) || [];

  const quickActions = [
    { 
      icon: Stethoscope, 
      label: language === 'zh' ? '添加就诊' : 'Add Visit',
      path: `/pet/${selectedPet?.id}/visit/new`,
      color: 'text-primary'
    },
    { 
      icon: Activity, 
      label: language === 'zh' ? '健康记录' : 'Health Record',
      path: `/pet/${selectedPet?.id}/health/new`,
      color: 'text-success'
    },
    { 
      icon: Receipt, 
      label: language === 'zh' ? '添加花费' : 'Add Expense',
      path: `/pet/${selectedPet?.id}/expense/new`,
      color: 'text-warning'
    },
  ];

  if (petsLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!pets || pets.length === 0) {
    return (
      <div className="page-container">
        <EmptyState
          icon={Activity}
          title={t('pet.noPets')}
          description={t('pet.addFirst')}
          action={{
            label: t('pet.add'),
            onClick: () => navigate('/pet/new'),
          }}
        />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header with Pet Selector */}
      <div className="flex items-center justify-between mb-6">
        <PetSelector
          pets={pets}
          selectedPet={selectedPet}
          onSelect={setSelectedPet}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/pet/new')}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="section-title">{t('common.quickActions')}</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => selectedPet && navigate(action.path)}
              disabled={!selectedPet}
              className="card-elevated p-4 flex flex-col items-center gap-2 hover:bg-accent/50 transition-colors disabled:opacity-50"
            >
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <span className="text-xs font-medium text-foreground text-center">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Upcoming Reminders */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title mb-0">{t('reminder.upcoming')}</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/reminders')}
            className="text-muted-foreground"
          >
            {language === 'zh' ? '查看全部' : 'View All'}
          </Button>
        </div>
        
        {upcomingReminders.length > 0 ? (
          <div className="space-y-2">
            {upcomingReminders.map((reminder: any) => (
              <div
                key={reminder.id}
                className="card-elevated p-3 flex items-center gap-3"
              >
                <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {reminder.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {reminder.pets?.name && `${reminder.pets.name} · `}
                    {formatDueDate(reminder.due_date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-elevated p-6 text-center">
            <p className="text-muted-foreground text-sm">{t('reminder.noReminders')}</p>
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="section-title">{t('common.recentActivity')}</h2>
        <div className="card-elevated p-6 text-center">
          <p className="text-muted-foreground text-sm">
            {language === 'zh' 
              ? '开始记录宠物的健康和花费吧' 
              : 'Start tracking your pet\'s health and expenses'}
          </p>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
