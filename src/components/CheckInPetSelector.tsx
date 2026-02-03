import { motion } from 'framer-motion';
import { Check, Bone, Fish } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Pet {
  id: string;
  name: string;
  species: string;
  avatar_url?: string | null;
}

interface CheckInPetSelectorProps {
  pets: Pet[];
  selectedPetId: string | null;
  onSelect: (petId: string) => void;
  checkedInPetIds?: string[];
}

export function CheckInPetSelector({ 
  pets, 
  selectedPetId, 
  onSelect, 
  checkedInPetIds = []
}: CheckInPetSelectorProps) {
  const { language } = useLanguage();

  if (pets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        {language === 'zh' 
          ? '请先添加宠物' 
          : 'Please add a pet first'}
      </p>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {pets.map((pet) => {
        const isSelected = selectedPetId === pet.id;
        const isCheckedIn = checkedInPetIds.includes(pet.id);
        
        return (
          <motion.button
            key={pet.id}
            onClick={() => onSelect(pet.id)}
            className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl transition-all min-w-[80px] ${
              isSelected
                ? 'bg-primary/10 border-2 border-primary'
                : 'bg-muted/50 border-2 border-transparent hover:bg-muted'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-background">
                <AvatarImage src={pet.avatar_url || undefined} alt={pet.name} />
                <AvatarFallback className="bg-primary/20">
                  {pet.species === 'dog' ? (
                    <Bone className="h-5 w-5 text-primary" />
                  ) : (
                    <Fish className="h-5 w-5 text-primary" />
                  )}
                </AvatarFallback>
              </Avatar>
              
              {isCheckedIn && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            <span className={`text-xs font-medium truncate max-w-[70px] ${
              isSelected ? 'text-primary' : 'text-foreground'
            }`}>
              {pet.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
