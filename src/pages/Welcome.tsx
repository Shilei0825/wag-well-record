import { useNavigate } from 'react-router-dom';
import { PawPrint, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
          className="text-sm"
        >
          {language === 'zh' ? 'EN' : '中文'}
        </Button>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-fade-in">
          <PawPrint className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground text-center mb-3 animate-fade-in">
          {t('app.name')}
        </h1>
        
        <p className="text-muted-foreground text-center max-w-xs mb-12 animate-fade-in">
          {t('app.tagline')}
        </p>

        {/* Features */}
        <div className="w-full max-w-sm space-y-4 mb-12">
          <div className="flex items-center gap-4 p-4 card-elevated animate-fade-in">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {language === 'zh' ? '健康追踪' : 'Health Tracking'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' ? '疫苗、驱虫、用药记录' : 'Vaccines, deworming, medications'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 card-elevated animate-fade-in">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {language === 'zh' ? '就诊管理' : 'Vet Visits'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' ? '记录诊断和费用' : 'Track diagnoses and costs'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 space-y-3 max-w-sm mx-auto w-full">
        <Button
          onClick={() => navigate('/login')}
          className="w-full btn-mobile"
        >
          {t('auth.login')}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/register')}
          className="w-full btn-mobile"
        >
          {t('auth.register')}
        </Button>
      </div>
    </div>
  );
}
