import { useParams, useNavigate } from 'react-router-dom';
import { Dog, Cat, Activity, Stethoscope, Receipt, Bell, Calendar, Weight, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePet } from '@/hooks/usePets';
import { useExpenses } from '@/hooks/useExpenses';
import { useVisits } from '@/hooks/useVisits';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { BottomNav } from '@/components/BottomNav';
import { format, parseISO, startOfMonth, startOfYear, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';

export default function PetProfile() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: pet, isLoading } = usePet(petId);
  const { data: expenses } = useExpenses(petId);
  const { data: visits } = useVisits(petId);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);

  const monthExpenses = expenses
    ?.filter((e) => isAfter(parseISO(e.date), monthStart))
    .reduce((sum, e) => sum + e.amount, 0) || 0;

  const yearExpenses = expenses
    ?.filter((e) => isAfter(parseISO(e.date), yearStart))
    .reduce((sum, e) => sum + e.amount, 0) || 0;

  const lastVisit = visits?.[0];

  const getAge = () => {
    if (!pet?.birthdate) return null;
    const birth = new Date(pet.birthdate);
    const now = new Date();
    
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    
    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // Adjust if day hasn't passed yet this month
    if (now.getDate() < birth.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }
    
    if (years > 0 && months > 0) {
      return language === 'zh' 
        ? `${years}岁${months}个月` 
        : `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
    }
    if (years > 0) {
      return language === 'zh' ? `${years}岁` : `${years} year${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
      return language === 'zh' ? `${months}个月` : `${months} month${months > 1 ? 's' : ''}`;
    }
    return language === 'zh' ? '不到1个月' : 'Less than 1 month';
  };

  const menuItems = [
    { icon: Activity, label: t('health.records'), path: `/pet/${petId}/health` },
    { icon: Stethoscope, label: t('visit.visits'), path: `/pet/${petId}/visits` },
    { icon: Receipt, label: t('expense.expenses'), path: `/pet/${petId}/expenses` },
    { icon: Bell, label: t('reminder.reminders'), path: '/reminders' },
  ];

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="page-container">
        <PageHeader title={t('pet.profile')} showBack />
        <p className="text-center text-muted-foreground">Pet not found</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title={t('pet.profile')}
        showBack
        action={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/pet/${petId}/edit`)}
          >
            <Edit2 className="h-5 w-5" />
          </Button>
        }
      />

      {/* Pet Info Card */}
      <div className="card-elevated p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={cn(
              'h-16 w-16 rounded-full flex items-center justify-center',
              pet.species === 'dog' ? 'bg-pet-dog/10' : 'bg-pet-cat/10'
            )}
          >
            {pet.species === 'dog' ? (
              <Dog className="h-8 w-8 text-pet-dog" />
            ) : (
              <Cat className="h-8 w-8 text-pet-cat" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{pet.name}</h2>
            <p className="text-muted-foreground">
              {t(`pet.${pet.species}`)}
              {pet.breed && ` · ${pet.breed}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {getAge() && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{getAge()}</span>
            </div>
          )}
          {pet.weight && (
            <div className="flex items-center gap-2 text-sm">
              <Weight className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{pet.weight} kg</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={Receipt}
          label={t('expense.thisMonth')}
          value={`¥${monthExpenses.toFixed(0)}`}
        />
        <StatCard
          icon={Receipt}
          label={t('expense.thisYear')}
          value={`¥${yearExpenses.toFixed(0)}`}
        />
      </div>

      {lastVisit && (
        <div className="card-elevated p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-1">{t('common.lastVisit')}</p>
          <p className="font-medium text-foreground">
            {format(parseISO(lastVisit.visit_date), 'yyyy-MM-dd')} - {lastVisit.clinic_name}
          </p>
        </div>
      )}

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full card-elevated p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <item.icon className="h-5 w-5 text-foreground" />
            </div>
            <span className="font-medium text-foreground">{item.label}</span>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
