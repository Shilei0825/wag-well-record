import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Receipt, Stethoscope, UtensilsCrossed, Package, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePet } from '@/hooks/usePets';
import { useExpenses, Expense } from '@/hooks/useExpenses';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { BottomNav } from '@/components/BottomNav';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const categoryIcons = {
  medical: Stethoscope,
  food: UtensilsCrossed,
  supplies: Package,
  other: MoreHorizontal,
};

const categoryColors = {
  medical: 'text-expense-medical bg-expense-medical/10',
  food: 'text-expense-food bg-expense-food/10',
  supplies: 'text-expense-supplies bg-expense-supplies/10',
  other: 'text-expense-other bg-expense-other/10',
};

function ExpenseItem({ expense }: { expense: Expense }) {
  const { t } = useLanguage();
  const Icon = categoryIcons[expense.category];
  const colorClass = categoryColors[expense.category];
  
  return (
    <div className="card-elevated p-4 flex items-center gap-4">
      <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{t(`expense.${expense.category}`)}</p>
        <p className="text-sm text-muted-foreground">
          {format(parseISO(expense.date), 'yyyy-MM-dd')}
          {expense.merchant && ` · ${expense.merchant}`}
        </p>
        {expense.notes && (
          <p className="text-sm text-muted-foreground truncate">{expense.notes}</p>
        )}
      </div>
      <span className="text-lg font-semibold text-foreground">
        ¥{expense.amount}
      </span>
    </div>
  );
}

export default function Expenses() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: pet } = usePet(petId);
  const { data: expenses, isLoading } = useExpenses(petId);

  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

  return (
    <div className="page-container">
      <PageHeader
        title={pet?.name ? `${pet.name} - ${t('expense.expenses')}` : t('expense.expenses')}
        showBack
        action={
          <Button
            size="icon"
            onClick={() => navigate(`/pet/${petId}/expense/new`)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      {expenses && expenses.length > 0 && (
        <div className="card-elevated p-4 mb-4 text-center">
          <p className="text-sm text-muted-foreground">{t('insights.totalExpenses')}</p>
          <p className="text-2xl font-bold text-foreground">¥{totalExpenses.toFixed(2)}</p>
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-muted-foreground">{t('common.loading')}</p>
      ) : expenses && expenses.length > 0 ? (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Receipt}
          title={t('expense.noExpenses')}
          action={{
            label: t('expense.add'),
            onClick: () => navigate(`/pet/${petId}/expense/new`),
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}
