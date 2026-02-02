import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dog, Cat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreatePet } from '@/hooks/usePets';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AddPet() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const createPet = useCreatePet();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'dog' | 'cat'>('dog');
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | ''>('');
  const [birthdate, setBirthdate] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createPet.mutateAsync({
        name,
        species,
        breed: breed || undefined,
        sex: sex as 'male' | 'female' | undefined,
        birthdate: birthdate || undefined,
        weight: weight ? parseFloat(weight) : undefined,
        notes: notes || undefined,
      });

      toast.success(language === 'zh' ? '添加成功' : 'Pet added successfully');
      navigate('/pets');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="page-container pb-6">
      <PageHeader title={t('pet.add')} showBack />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Species Selection */}
        <div className="space-y-2">
          <Label>{t('pet.species')}</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSpecies('dog')}
              className={cn(
                'card-elevated p-4 flex flex-col items-center gap-2 transition-all',
                species === 'dog' 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-accent/50'
              )}
            >
              <Dog className="h-8 w-8 text-pet-dog" />
              <span className="font-medium">{t('pet.dog')}</span>
            </button>
            <button
              type="button"
              onClick={() => setSpecies('cat')}
              className={cn(
                'card-elevated p-4 flex flex-col items-center gap-2 transition-all',
                species === 'cat' 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-accent/50'
              )}
            >
              <Cat className="h-8 w-8 text-pet-cat" />
              <span className="font-medium">{t('pet.cat')}</span>
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">{t('pet.name')} *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-mobile"
            placeholder={language === 'zh' ? '宠物名字' : 'Pet name'}
          />
        </div>

        {/* Breed */}
        <div className="space-y-2">
          <Label htmlFor="breed">
            {t('pet.breed')} <span className="text-muted-foreground">({t('common.optional')})</span>
          </Label>
          <Input
            id="breed"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="input-mobile"
            placeholder={language === 'zh' ? '如：金毛、布偶猫' : 'e.g. Golden Retriever, Ragdoll'}
          />
        </div>

        {/* Sex */}
        <div className="space-y-2">
          <Label>{t('pet.sex')} <span className="text-muted-foreground">({t('common.optional')})</span></Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSex(sex === 'male' ? '' : 'male')}
              className={cn(
                'card-elevated p-3 text-center transition-all',
                sex === 'male' 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-accent/50'
              )}
            >
              <span className="font-medium">{t('pet.male')}</span>
            </button>
            <button
              type="button"
              onClick={() => setSex(sex === 'female' ? '' : 'female')}
              className={cn(
                'card-elevated p-3 text-center transition-all',
                sex === 'female' 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-accent/50'
              )}
            >
              <span className="font-medium">{t('pet.female')}</span>
            </button>
          </div>
        </div>

        {/* Birthdate */}
        <div className="space-y-2">
          <Label htmlFor="birthdate">
            {t('pet.birthdate')} <span className="text-muted-foreground">({t('common.optional')})</span>
          </Label>
          <Input
            id="birthdate"
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="input-mobile"
          />
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight">
            {t('pet.weight')} <span className="text-muted-foreground">({t('common.optional')})</span>
          </Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="input-mobile"
            placeholder="0.0"
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
            className="min-h-[100px]"
            placeholder={language === 'zh' ? '其他备注信息...' : 'Additional notes...'}
          />
        </div>

        <Button
          type="submit"
          disabled={createPet.isPending || !name}
          className="w-full btn-mobile"
        >
          {createPet.isPending ? t('common.loading') : t('common.save')}
        </Button>
      </form>
    </div>
  );
}
