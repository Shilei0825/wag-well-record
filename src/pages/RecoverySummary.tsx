import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRecoveryPlan, useRecoveryCheckins } from "@/hooks/useRecoveryPlans";
import { usePets } from "@/hooks/usePets";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  CheckCircle2,
  Home,
  Calendar
} from "lucide-react";

export default function RecoverySummary() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const { data: plan, isLoading: planLoading } = useRecoveryPlan(planId || '');
  const { data: checkins = [] } = useRecoveryCheckins(planId || '');
  const { data: pets = [] } = usePets();

  const pet = pets.find(p => p.id === plan?.pet_id);

  if (planLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background p-4">
        <PageHeader title="未找到计划" showBack />
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (plan.recovery_trend) {
      case 'improving':
        return <TrendingUp className="h-8 w-8 text-green-500" />;
      case 'worsening':
        return <TrendingDown className="h-8 w-8 text-red-500" />;
      default:
        return <Minus className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getTrendLabel = () => {
    switch (plan.recovery_trend) {
      case 'improving':
        return '趋势向好';
      case 'worsening':
        return '需要关注';
      default:
        return '保持稳定';
    }
  };

  const getTrendColor = () => {
    switch (plan.recovery_trend) {
      case 'improving':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'worsening':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const translateAppetite = (appetite: string) => {
    const map: Record<string, string> = {
      normal: '正常',
      reduced: '减少',
      poor: '很差'
    };
    return map[appetite] || appetite;
  };

  const translateEnergy = (energy: string) => {
    const map: Record<string, string> = {
      normal: '正常',
      low: '较低',
      very_low: '很低'
    };
    return map[energy] || energy;
  };

  const translateSymptom = (symptom: string) => {
    const map: Record<string, string> = {
      improved: '好转',
      same: '持平',
      worse: '加重'
    };
    return map[symptom] || symptom;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-6">
        <PageHeader title="恢复总结" showBack />

        {/* Header Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{pet?.name}</h2>
              <p className="text-muted-foreground">{plan.main_symptom} · {plan.duration_days}天观察</p>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="font-medium">{getTrendLabel()}</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Summary */}
        {plan.ai_summary && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                AI 观察总结
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{plan.ai_summary}</p>
              
              {plan.suggestion && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium mb-1">建议</p>
                  <p className="text-sm text-muted-foreground">{plan.suggestion}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Daily Records */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              每日记录
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checkins.map((checkin) => (
              <div 
                key={checkin.id} 
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">第 {checkin.day_index} 天</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(checkin.created_at), 'M月d日 HH:mm', { locale: zhCN })}
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-background rounded">
                    🍽️ {translateAppetite(checkin.appetite)}
                  </span>
                  <span className="px-2 py-1 bg-background rounded">
                    ⚡ {translateEnergy(checkin.energy)}
                  </span>
                  <span className="px-2 py-1 bg-background rounded">
                    📊 {translateSymptom(checkin.symptom_status)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">重要提示</p>
                <p>此总结仅供参考，不构成医学诊断。如症状持续或加重，请及时就医。</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full h-12"
          >
            <Home className="h-5 w-5 mr-2" />
            返回首页
          </Button>
          {pet && (
            <Button
              variant="outline"
              onClick={() => navigate(`/pet/${pet.id}`)}
              className="w-full"
            >
              查看 {pet.name} 的资料
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
