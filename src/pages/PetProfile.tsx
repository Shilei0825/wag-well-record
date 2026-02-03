import { useParams, useNavigate } from 'react-router-dom';
import { Dog, Cat, Activity, Stethoscope, Receipt, Bell, Calendar, Weight, Edit2, Cake, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePet } from '@/hooks/usePets';
import { useExpenses } from '@/hooks/useExpenses';
import { useVisits } from '@/hooks/useVisits';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { BottomNav } from '@/components/BottomNav';
import { PetAvatarUpload } from '@/components/PetAvatarUpload';
import { format, parseISO, startOfMonth, startOfYear, isAfter, differenceInDays, setYear } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

export default function PetProfile() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: pet, isLoading } = usePet(petId);
  const { data: expenses } = useExpenses(petId);
  const { data: visits } = useVisits(petId);
  const queryClient = useQueryClient();

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

  const getUpcomingBirthday = () => {
    if (!pet?.birthdate) return null;
    
    const birth = parseISO(pet.birthdate);
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Get this year's birthday
    let nextBirthday = setYear(birth, currentYear);
    
    // If birthday has passed this year, get next year's
    if (differenceInDays(nextBirthday, now) < 0) {
      nextBirthday = setYear(birth, currentYear + 1);
    }
    
    const daysUntil = differenceInDays(nextBirthday, now);
    const turningAge = nextBirthday.getFullYear() - birth.getFullYear();
    
    return { daysUntil, turningAge, date: nextBirthday };
  };

  const birthdayInfo = getUpcomingBirthday();
  const isBirthdaySoon = birthdayInfo && birthdayInfo.daysUntil <= 7;
  const isBirthdayToday = birthdayInfo && birthdayInfo.daysUntil === 0;

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

      {/* Birthday Celebration Banner */}
      {birthdayInfo && birthdayInfo.daysUntil <= 30 && (
        <div 
          className={cn(
            "card-elevated p-4 mb-4 relative overflow-hidden",
            isBirthdayToday 
              ? "bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border-amber-500/30" 
              : isBirthdaySoon 
                ? "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20"
                : "bg-muted/30"
          )}
        >
          {/* Celebration particles for birthday */}
          {isBirthdayToday && (
            <>
              <div className="absolute top-2 left-4 animate-bounce" style={{ animationDelay: '0ms' }}>
                <PartyPopper className="h-5 w-5 text-amber-500" />
              </div>
              <div className="absolute top-3 right-6 animate-bounce" style={{ animationDelay: '150ms' }}>
                <PartyPopper className="h-4 w-4 text-pink-500" />
              </div>
              <div className="absolute bottom-2 left-8 animate-bounce" style={{ animationDelay: '300ms' }}>
                <PartyPopper className="h-4 w-4 text-purple-500" />
              </div>
              <div className="absolute bottom-3 right-4 animate-bounce" style={{ animationDelay: '450ms' }}>
                <PartyPopper className="h-5 w-5 text-amber-400" />
              </div>
            </>
          )}
          
          <div className="flex items-center gap-3 relative z-10">
            <div className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center",
              isBirthdayToday 
                ? "bg-gradient-to-br from-amber-400 to-pink-500 animate-pulse" 
                : "bg-primary/10"
            )}>
              <Cake className={cn(
                "h-6 w-6",
                isBirthdayToday ? "text-white" : "text-primary"
              )} />
            </div>
            <div className="flex-1">
              {isBirthdayToday ? (
                <>
                  <p className="font-bold text-foreground">
                    🎉 {language === 'zh' ? '生日快乐!' : 'Happy Birthday!'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pet?.name} {language === 'zh' ? `今天${birthdayInfo.turningAge}岁啦!` : `turns ${birthdayInfo.turningAge} today!`}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-foreground">
                    {language === 'zh' ? '生日倒计时' : 'Birthday Countdown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {birthdayInfo.daysUntil === 1
                      ? (language === 'zh' ? '明天就是生日啦! 🎂' : 'Tomorrow! 🎂')
                      : (language === 'zh' 
                          ? `还有 ${birthdayInfo.daysUntil} 天满 ${birthdayInfo.turningAge} 岁`
                          : `${birthdayInfo.daysUntil} days until turning ${birthdayInfo.turningAge}`
                        )
                    }
                  </p>
                </>
              )}
            </div>
            {isBirthdaySoon && !isBirthdayToday && (
              <div className="text-2xl animate-bounce">🎂</div>
            )}
          </div>
        </div>
      )}

      {/* Pet Info Card */}
      <div className="card-elevated p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <PetAvatarUpload
            petId={petId!}
            species={pet.species as 'dog' | 'cat'}
            currentAvatarUrl={pet.avatar_url}
            onUploadComplete={() => {
              queryClient.invalidateQueries({ queryKey: ['pet', petId] });
              queryClient.invalidateQueries({ queryKey: ['pets'] });
            }}
            size="lg"
          />
          <div>
            <h2 className="text-xl font-bold text-foreground">{pet.name}</h2>
            <p className="text-muted-foreground">
              {t(`pet.${pet.species}`)}
              {pet.breed && ` · ${pet.breed}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {pet.birthdate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-foreground">{getAge()}</span>
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(pet.birthdate), 'yyyy-MM-dd')}
                </span>
              </div>
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
