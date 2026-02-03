import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePets } from '@/hooks/usePets';
import { useCreateReminder } from '@/hooks/useReminders';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';

export default function AddReminder() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: pets } = usePets();
  const createReminder = useCreateReminder();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [petId, setPetId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createReminder.mutateAsync({
        title,
        due_date: dueDate,
        pet_id: petId || undefined,
        source_type: 'custom',
      });

      toast.success(language === 'zh' ? '添加成功' : 'Reminder added successfully');
      navigate('/reminders');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="page-container pb-6">
      <PageHeader title={t('reminder.add')} showBack />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">{t('reminder.title')} *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input-mobile"
            placeholder={language === 'zh' ? '提醒内容' : 'Reminder title'}
          />
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label htmlFor="dueDate">{t('reminder.dueDate')} *</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="input-mobile"
          />
        </div>

        {/* Pet (Optional) */}
        {pets && pets.length > 0 && (
          <div className="space-y-2">
            <Label>
              {language === 'zh' ? '关联宠物' : 'Related Pet'}{' '}
              <span className="text-muted-foreground">({t('common.optional')})</span>
            </Label>
            <Select value={petId || 'none'} onValueChange={(val) => setPetId(val === 'none' ? '' : val)}>
              <SelectTrigger className="input-mobile">
                <SelectValue placeholder={language === 'zh' ? '选择宠物' : 'Select a pet'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {language === 'zh' ? '不关联' : 'None'}
                </SelectItem>
                {pets.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          type="submit"
          disabled={createReminder.isPending || !title || !dueDate}
          className="w-full btn-mobile"
        >
          {createReminder.isPending ? t('common.loading') : t('common.save')}
        </Button>
      </form>
    </div>
  );
}
