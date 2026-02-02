import { Dog, Cat, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Pet } from '@/hooks/usePets';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PetCardProps {
  pet: Pet;
}

export function PetCard({ pet }: PetCardProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const getAge = () => {
    if (!pet.birthdate) return null;
    const birth = new Date(pet.birthdate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    
    if (years > 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    if (months > 0) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    return null;
  };

  return (
    <button
      onClick={() => navigate(`/pet/${pet.id}`)}
      className="w-full card-elevated p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors text-left"
    >
      <div
        className={cn(
          'h-14 w-14 rounded-full flex items-center justify-center',
          pet.species === 'dog' 
            ? 'bg-pet-dog/10' 
            : 'bg-pet-cat/10'
        )}
      >
        {pet.species === 'dog' ? (
          <Dog className="h-7 w-7 text-pet-dog" />
        ) : (
          <Cat className="h-7 w-7 text-pet-cat" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{pet.name}</h3>
        <p className="text-sm text-muted-foreground">
          {t(`pet.${pet.species}`)}
          {pet.breed && ` · ${pet.breed}`}
          {getAge() && ` · ${getAge()}`}
        </p>
      </div>
      
      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
    </button>
  );
}
