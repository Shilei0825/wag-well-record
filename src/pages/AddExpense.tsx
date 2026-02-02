import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stethoscope, UtensilsCrossed, Package, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreateExpense } from '@/hooks/useExpenses';
import { PageHeader } from '@/components/PageHeader';
import { DocumentScanner } from '@/components/DocumentScanner';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const categories = [
  { value: 'medical', icon: Stethoscope, color: 'text-expense-medical' },
  { value: 'food', icon: UtensilsCrossed, color: 'text-expense-food' },
  { value: 'supplies', icon: Package, color: 'text-expense-supplies' },
  { value: 'other', icon: MoreHorizontal, color: 'text-expense-other' },
] as const;

export default function AddExpense() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const createExpense = useCreateExpense();

  const [category, setCategory] = useState<'medical' | 'food' | 'supplies' | 'other'>('medical');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!petId) return;

    try {
      await createExpense.mutateAsync({
        pet_id: petId,
        category,
        date,
        amount: parseFloat(amount),
        merchant: merchant || undefined,
        notes: notes || undefined,
      });

      toast.success(language === 'zh' ? '添加成功' : 'Expense added successfully');
      navigate(`/pet/${petId}/expenses`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleScanComplete = (data: any) => {
    if (data.category && ['medical', 'food', 'supplies', 'other'].includes(data.category)) {
      setCategory(data.category);
    }
    if (data.date) setDate(data.date);
    if (data.amount) setAmount(String(data.amount));
    if (data.merchant) setMerchant(data.merchant);
    if (data.notes) setNotes(data.notes);
  };

  return (
    <div className="page-container pb-6">
      <PageHeader title={t('expense.add')} showBack />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Scanner */}
        <DocumentScanner 
          documentType="expense" 
          onScanComplete={handleScanComplete} 
        />
        {/* Category Selection */}
        <div className="space-y-2">
          <Label>{t('expense.category')}</Label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value)}
                className={cn(
                  'card-elevated p-3 flex flex-col items-center gap-2 transition-all',
                  category === item.value 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-accent/50'
                )}
              >
                <item.icon className={cn('h-5 w-5', item.color)} />
                <span className="text-xs font-medium">{t(`expense.${item.value}`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">{t('health.date')} *</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="input-mobile"
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">{t('expense.amount')} (¥) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="input-mobile"
            placeholder="0.00"
          />
        </div>

        {/* Merchant */}
        <div className="space-y-2">
          <Label htmlFor="merchant">
            {t('expense.merchant')} <span className="text-muted-foreground">({t('common.optional')})</span>
          </Label>
          <Input
            id="merchant"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="input-mobile"
            placeholder={language === 'zh' ? '商家名称' : 'Merchant name'}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">
            {t('pet.notes')} <span className="text-muted-foreground">({t('common.optional')})</span>
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
            placeholder={language === 'zh' ? '其他备注...' : 'Additional notes...'}
          />
        </div>

        <Button
          type="submit"
          disabled={createExpense.isPending || !amount}
          className="w-full btn-mobile"
        >
          {createExpense.isPending ? t('common.loading') : t('common.save')}
        </Button>
      </form>
    </div>
  );
}
