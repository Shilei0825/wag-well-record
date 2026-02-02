import { Home, PawPrint, BarChart3, Settings, Stethoscope } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', icon: Home, labelKey: 'nav.home' },
  { path: '/pets', icon: PawPrint, labelKey: 'nav.pets' },
  { path: '/ai-vet', icon: Stethoscope, labelKey: 'nav.aivet' },
  { path: '/insights', icon: BarChart3, labelKey: 'nav.insights' },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/pets' && location.pathname.startsWith('/pet'));
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
