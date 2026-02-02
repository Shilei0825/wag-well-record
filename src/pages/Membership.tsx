import { Crown, Check, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/PageHeader';
import { BottomNav } from '@/components/BottomNav';
import { toast } from 'sonner';

export default function Membership() {
  const { t, language } = useLanguage();

  const freeFeatures = language === 'zh' 
    ? ['添加宠物档案', '记录健康信息', '记录就诊和花费', '基础数据统计']
    : ['Add pet profiles', 'Track health records', 'Log visits and expenses', 'Basic insights'];

  const premiumFeatures = language === 'zh'
    ? ['AI发票识别', '费用对比分析', '一键申请保险', '专属客服支持']
    : ['AI receipt scanning', 'Cost comparison', 'One-click insurance', 'Priority support'];

  const handleNotify = () => {
    toast.success(
      language === 'zh' 
        ? '我们会在会员服务上线时通知您' 
        : 'We\'ll notify you when membership launches'
    );
  };

  return (
    <div className="page-container">
      <PageHeader title={t('membership.title')} showBack />

      <div className="space-y-6">
        {/* Free Plan */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Crown className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('membership.free')}</h3>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' ? '当前计划' : 'Current Plan'}
              </p>
            </div>
          </div>
          <ul className="space-y-2">
            {freeFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-success flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Premium Plan */}
        <div className="card-elevated p-6 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('membership.premium')}</h3>
              <p className="text-sm text-primary">{t('membership.comingSoon')}</p>
            </div>
          </div>
          <ul className="space-y-2 mb-6">
            {premiumFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          <Button 
            onClick={handleNotify}
            className="w-full btn-mobile"
          >
            <Bell className="h-5 w-5 mr-2" />
            {t('membership.notify')}
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
