import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRecoveryPlan, useRecoveryCheckins } from "@/hooks/useRecoveryPlans";
import { usePets } from "@/hooks/usePets";
import { format, differenceInDays } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Heart, Calendar, CheckCircle2, Circle, ChevronRight } from "lucide-react";

export default function RecoveryDetail() {
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

  const completedDays = checkins.length;
  const progress = (completedDays / plan.duration_days) * 100;
  const daysSinceStart = differenceInDays(new Date(), new Date(plan.created_at)) + 1;
  const currentDay = Math.min(daysSinceStart, plan.duration_days);
  const needsCheckinToday = completedDays < currentDay && plan.status === 'active';

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

  // Generate all days
  const allDays = Array.from({ length: plan.duration_days }, (_, i) => {
    const dayIndex = i + 1;
    const checkin = checkins.find(c => c.day_index === dayIndex);
    const isToday = dayIndex === currentDay;
    const isPast = dayIndex < currentDay;
    const isFuture = dayIndex > currentDay;
    const isCompleted = !!checkin;

    return { dayIndex, checkin, isToday, isPast, isFuture, isCompleted };
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-6">
        <PageHeader title="恢复观察" showBack />

        {/* Header Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{pet?.name}</h2>
                <p className="text-sm text-muted-foreground">{plan.main_symptom}</p>
              </div>
              {plan.status === 'completed' ? (
                <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">
                  已完成
                </span>
              ) : (
                <span className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full">
                  进行中
                </span>
              )}
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">观察进度</span>
                <span className="font-medium">{completedDays} / {plan.duration_days} 天</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Today's Checkin CTA */}
        {needsCheckinToday && (
          <Card 
            className="border-primary bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => navigate(`/recovery/${plan.id}/checkin`)}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">今天 {pet?.name} 的状态如何？</p>
                    <p className="text-sm text-muted-foreground">点击记录第 {currentDay} 天观察</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">观察记录</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allDays.map(({ dayIndex, checkin, isToday, isFuture, isCompleted }) => (
              <div 
                key={dayIndex}
                className={`flex gap-4 ${isFuture ? 'opacity-50' : ''}`}
              >
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : isToday ? (
                    <div className="h-6 w-6 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground/30" />
                  )}
                  {dayIndex < plan.duration_days && (
                    <div className={`w-0.5 h-full min-h-[40px] ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${isToday ? 'text-primary' : ''}`}>
                      第 {dayIndex} 天
                      {isToday && <span className="ml-2 text-xs">(今天)</span>}
                    </p>
                    {checkin && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(checkin.created_at), 'M月d日', { locale: zhCN })}
                      </span>
                    )}
                  </div>

                  {checkin ? (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-muted rounded">
                        🍽️ {translateAppetite(checkin.appetite)}
                      </span>
                      <span className="px-2 py-1 bg-muted rounded">
                        ⚡ {translateEnergy(checkin.energy)}
                      </span>
                      <span className="px-2 py-1 bg-muted rounded">
                        📊 {translateSymptom(checkin.symptom_status)}
                      </span>
                    </div>
                  ) : isToday && !isCompleted ? (
                    <p className="text-sm text-muted-foreground mt-1">待记录</p>
                  ) : isFuture ? (
                    <p className="text-sm text-muted-foreground mt-1">即将到来</p>
                  ) : (
                    <p className="text-sm text-red-500 mt-1">未记录</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* View Summary if completed */}
        {plan.status === 'completed' && (
          <Button
            onClick={() => navigate(`/recovery/${plan.id}/summary`)}
            className="w-full h-12"
          >
            查看 AI 总结
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
