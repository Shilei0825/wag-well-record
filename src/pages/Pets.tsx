import { useNavigate } from 'react-router-dom';
import { Plus, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePets } from '@/hooks/usePets';
import { PetCard } from '@/components/PetCard';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { BottomNav } from '@/components/BottomNav';

export default function Pets() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: pets, isLoading } = usePets();

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title={t('pet.myPets')}
        action={
          <Button
            size="icon"
            onClick={() => navigate('/pet/new')}
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      {pets && pets.length > 0 ? (
        <div className="space-y-3">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PawPrint}
          title={t('pet.noPets')}
          description={t('pet.addFirst')}
          action={{
            label: t('pet.add'),
            onClick: () => navigate('/pet/new'),
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}
