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
  const { t, language } = useLanguage();

  const getAge = () => {
    if (!pet.birthdate) return null;
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
        : `${years}y ${months}m`;
    }
    if (years > 0) {
      return language === 'zh' ? `${years}岁` : `${years}y`;
    }
    if (months > 0) {
      return language === 'zh' ? `${months}个月` : `${months}m`;
    }
    return language === 'zh' ? '<1月' : '<1m';
  };

  return (
    <button
      onClick={() => navigate(`/pet/${pet.id}`)}
      className="w-full card-elevated p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors text-left"
    >
      <div
        className={cn(
          'h-14 w-14 rounded-full flex items-center justify-center overflow-hidden',
          pet.avatar_url
            ? 'bg-muted'
            : pet.species === 'dog' 
              ? 'bg-pet-dog/10' 
              : 'bg-pet-cat/10'
        )}
      >
        {pet.avatar_url ? (
          <img src={pet.avatar_url} alt={pet.name} className="h-full w-full object-cover" />
        ) : pet.species === 'dog' ? (
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
