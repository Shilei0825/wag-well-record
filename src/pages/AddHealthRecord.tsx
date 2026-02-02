import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Syringe, Bug, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreateHealthRecord } from '@/hooks/useHealthRecords';
import { useCreateReminder } from '@/hooks/useReminders';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const types = [
  { value: 'vaccine', icon: Syringe, color: 'text-primary' },
  { value: 'deworming', icon: Bug, color: 'text-warning' },
  { value: 'medication', icon: Pill, color: 'text-success' },
] as const;

export default function AddHealthRecord() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const createRecord = useCreateHealthRecord();
  const createReminder = useCreateReminder();

  const [type, setType] = useState<'vaccine' | 'deworming' | 'medication'>('vaccine');
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!petId) return;

    try {
      const record = await createRecord.mutateAsync({
        pet_id: petId,
        type,
        name,
        date,
        next_due_date: nextDueDate || undefined,
        notes: notes || undefined,
      });

      // Auto-create reminder if next due date is set
      if (nextDueDate) {
        await createReminder.mutateAsync({
          pet_id: petId,
          title: `${name} ${language === 'zh' ? '提醒' : 'Reminder'}`,
          due_date: nextDueDate,
          source_type: 'health_record',
          source_id: record.id,
        });
      }

      toast.success(language === 'zh' ? '添加成功' : 'Record added successfully');
      navigate(`/pet/${petId}/health`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="page-container pb-6">
      <PageHeader title={t('health.add')} showBack />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div className="space-y-2">
          <Label>{t('health.type')}</Label>
          <div className="grid grid-cols-3 gap-3">
            {types.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setType(item.value)}
                className={cn(
                  'card-elevated p-4 flex flex-col items-center gap-2 transition-all',
                  type === item.value 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-accent/50'
                )}
              >
                <item.icon className={cn('h-6 w-6', item.color)} />
                <span className="text-sm font-medium">{t(`health.${item.value}`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">{t('health.name')} *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-mobile"
            placeholder={language === 'zh' ? '如：狂犬疫苗' : 'e.g. Rabies vaccine'}
          />
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

        {/* Next Due Date */}
        <div className="space-y-2">
          <Label htmlFor="nextDueDate">
            {t('health.nextDue')} <span className="text-muted-foreground">({t('common.optional')})</span>
          </Label>
          <Input
            id="nextDueDate"
            type="date"
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
            className="input-mobile"
          />
          <p className="text-xs text-muted-foreground">
            {language === 'zh' 
              ? '设置下次提醒日期后会自动创建提醒' 
              : 'A reminder will be created automatically'}
          </p>
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
            className="min-h-[100px]"
            placeholder={language === 'zh' ? '其他备注...' : 'Additional notes...'}
          />
        </div>

        <Button
          type="submit"
          disabled={createRecord.isPending || !name || !date}
          className="w-full btn-mobile"
        >
          {createRecord.isPending ? t('common.loading') : t('common.save')}
        </Button>
      </form>
    </div>
  );
}
