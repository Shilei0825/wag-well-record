import { User, Globe, MessageSquare, Shield, FileText, LogOut, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { BottomNav } from '@/components/BottomNav';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success(language === 'zh' ? '已退出登录' : 'Logged out successfully');
    navigate('/');
  };

  const menuItems = [
    {
      icon: User,
      label: t('settings.account'),
      value: user?.email,
      onClick: () => {},
    },
    {
      icon: Globe,
      label: t('settings.language'),
      value: language === 'zh' ? '中文' : 'English',
      onClick: () => setLanguage(language === 'zh' ? 'en' : 'zh'),
    },
    {
      icon: Crown,
      label: t('membership.title'),
      value: t('membership.free'),
      onClick: () => navigate('/membership'),
    },
    {
      icon: MessageSquare,
      label: t('settings.feedback'),
      onClick: () => {},
    },
    {
      icon: Shield,
      label: t('settings.privacy'),
      onClick: () => {},
    },
    {
      icon: FileText,
      label: t('settings.terms'),
      onClick: () => {},
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title={t('settings.title')} />

      <div className="space-y-2 mb-8">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full card-elevated p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <item.icon className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{item.label}</p>
              {item.value && (
                <p className="text-sm text-muted-foreground">{item.value}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full btn-mobile text-destructive border-destructive/30 hover:bg-destructive/10"
      >
        <LogOut className="h-5 w-5 mr-2" />
        {t('auth.logout')}
      </Button>

      <BottomNav />
    </div>
  );
}
