import { Receipt, Stethoscope, UtensilsCrossed, Package, MoreHorizontal, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAllExpenses } from '@/hooks/useExpenses';
import { useAllVisits } from '@/hooks/useVisits';
import { PageHeader } from '@/components/PageHeader';
import { BottomNav } from '@/components/BottomNav';
import { startOfMonth, parseISO, isAfter, format } from 'date-fns';
import { cn } from '@/lib/utils';

const categoryConfig = {
  medical: { icon: Stethoscope, label: { zh: '医疗', en: 'Medical' }, color: 'bg-expense-medical' },
  food: { icon: UtensilsCrossed, label: { zh: '食品', en: 'Food' }, color: 'bg-expense-food' },
  supplies: { icon: Package, label: { zh: '用品', en: 'Supplies' }, color: 'bg-expense-supplies' },
  other: { icon: MoreHorizontal, label: { zh: '其他', en: 'Other' }, color: 'bg-expense-other' },
};

export default function Insights() {
  const { t, language } = useLanguage();
  const { data: expenses, isLoading: expensesLoading } = useAllExpenses();
  const { data: visits, isLoading: visitsLoading } = useAllVisits();

  const monthStart = startOfMonth(new Date());

  // Calculate monthly expenses
  const monthlyExpenses = expenses
    ?.filter((e: any) => isAfter(parseISO(e.date), monthStart))
    .reduce((sum: number, e: any) => sum + e.amount, 0) || 0;

  // Calculate expenses by category
  const expensesByCategory = expenses?.reduce((acc: Record<string, number>, e: any) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);

  // Recent visits (last 30 days)
  const recentVisits = visits?.slice(0, 5) || [];

  const isLoading = expensesLoading || visitsLoading;

  return (
    <div className="page-container">
      <PageHeader title={t('insights.title')} />

      {isLoading ? (
        <p className="text-center text-muted-foreground">{t('common.loading')}</p>
      ) : (
        <div className="space-y-6">
          {/* Monthly Total */}
          <div className="card-elevated p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">{t('expense.thisMonth')}</p>
            <p className="text-3xl font-bold text-foreground">¥{monthlyExpenses.toFixed(0)}</p>
          </div>

          {/* Expenses by Category */}
          <section>
            <h2 className="section-title">{t('insights.byCategory')}</h2>
            <div className="card-elevated p-4 space-y-4">
              {totalExpenses > 0 ? (
                Object.entries(categoryConfig).map(([key, config]) => {
                  const amount = expensesByCategory[key] || 0;
                  const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                  const Icon = config.icon;

                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{config.label[language]}</span>
                        </div>
                        <span className="text-sm font-medium">¥{amount.toFixed(0)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', config.color)}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  {t('expense.noExpenses')}
                </p>
              )}
            </div>
          </section>

          {/* Recent Visits */}
          <section>
            <h2 className="section-title">{t('insights.recentVisits')}</h2>
            {recentVisits.length > 0 ? (
              <div className="space-y-3">
                {recentVisits.map((visit: any) => (
                  <div key={visit.id} className="card-elevated p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {visit.pets?.name} - {visit.clinic_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(visit.visit_date), 'yyyy-MM-dd')}
                      </p>
                    </div>
                    {visit.total_cost && (
                      <span className="text-sm font-medium text-foreground">
                        ¥{visit.total_cost}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-elevated p-6 text-center">
                <p className="text-muted-foreground">{t('visit.noVisits')}</p>
              </div>
            )}
          </section>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
