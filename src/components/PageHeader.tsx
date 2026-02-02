import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  action?: ReactNode;
}

export function PageHeader({ title, showBack = false, action }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
      </div>
      {action}
    </header>
  );
}
