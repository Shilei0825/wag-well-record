import { ChevronDown, Dog, Cat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pet } from '@/hooks/usePets';
import { cn } from '@/lib/utils';

interface PetSelectorProps {
  pets: Pet[];
  selectedPet: Pet | null;
  onSelect: (pet: Pet) => void;
}

export function PetSelector({ pets, selectedPet, onSelect }: PetSelectorProps) {
  if (pets.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 h-10">
          {selectedPet ? (
            <>
              {selectedPet.species === 'dog' ? (
                <Dog className="h-4 w-4 text-pet-dog" />
              ) : (
                <Cat className="h-4 w-4 text-pet-cat" />
              )}
              <span className="font-medium">{selectedPet.name}</span>
            </>
          ) : (
            <span>Select Pet</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {pets.map((pet) => (
          <DropdownMenuItem
            key={pet.id}
            onClick={() => onSelect(pet)}
            className={cn(
              'gap-2 cursor-pointer',
              selectedPet?.id === pet.id && 'bg-accent'
            )}
          >
            {pet.species === 'dog' ? (
              <Dog className="h-4 w-4 text-pet-dog" />
            ) : (
              <Cat className="h-4 w-4 text-pet-cat" />
            )}
            <span>{pet.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
