import { useNavigate } from 'react-router-dom';
import { PawPrint, Heart, Shield, Stethoscope, Wallet, Activity, Bell, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  const features = [
    {
      icon: Heart,
      color: 'text-success',
      bg: 'bg-success/10',
      titleZh: '健康追踪',
      titleEn: 'Health Tracking',
      descZh: '疫苗、驱虫、用药记录',
      descEn: 'Vaccines, deworming, medications',
    },
    {
      icon: Shield,
      color: 'text-primary',
      bg: 'bg-primary/10',
      titleZh: '就诊管理',
      titleEn: 'Vet Visits',
      descZh: '记录诊断和费用',
      descEn: 'Track diagnoses and costs',
    },
    {
      icon: Stethoscope,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      titleZh: '宠博士问诊',
      titleEn: 'AI Vet Consult',
      descZh: 'AI 智能症状评估',
      descEn: 'AI-powered symptom assessment',
    },
    {
      icon: Activity,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      titleZh: '恢复观察',
      titleEn: 'Recovery Tracking',
      descZh: '术后/病后每日跟踪',
      descEn: 'Post-treatment daily check-ins',
    },
    {
      icon: Wallet,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      titleZh: '花费统计',
      titleEn: 'Expense Insights',
      descZh: '医疗、食品、用品分类',
      descEn: 'Medical, food, supplies breakdown',
    },
    {
      icon: Camera,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
      titleZh: '每日打卡',
      titleEn: 'Daily Check-in',
      descZh: '记录宠物成长点滴',
      descEn: 'Capture daily pet moments',
    },
  ];

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
      <div className="flex-1 flex flex-col items-center px-6 pt-12 pb-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-fade-in">
          <PawPrint className="h-10 w-10 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground text-center mb-2 animate-fade-in">
          {t('app.name')}
        </h1>
        
        <p className="text-muted-foreground text-center text-sm max-w-xs mb-8 animate-fade-in">
          {t('app.tagline')}
        </p>

        {/* Features Grid */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 p-4 card-elevated animate-fade-in text-center"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`h-10 w-10 rounded-lg ${feature.bg} flex items-center justify-center`}>
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {language === 'zh' ? feature.titleZh : feature.titleEn}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {language === 'zh' ? feature.descZh : feature.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trademark */}
        <p className="text-xs text-muted-foreground mt-auto">
          {t('app.trademark')}
        </p>
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