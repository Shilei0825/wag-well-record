import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRecoveryCheckins, RecoveryPlan } from "@/hooks/useRecoveryPlans";
import { format, differenceInDays } from "date-fns";
import { zhCN } from "date-fns/locale";

interface RecoveryPlanCardProps {
  plan: RecoveryPlan;
  petName: string;
}

export function RecoveryPlanCard({ plan, petName }: RecoveryPlanCardProps) {
  const navigate = useNavigate();
  const { data: checkins = [] } = useRecoveryCheckins(plan.id);

  const completedDays = checkins.length;
  const totalDays = plan.duration_days;
  const progress = (completedDays / totalDays) * 100;

  const daysSinceStart = differenceInDays(new Date(), new Date(plan.created_at)) + 1;
  const currentDay = Math.min(daysSinceStart, totalDays);
  const needsCheckinToday = completedDays < currentDay && plan.status === 'active';

  const handleClick = () => {
    if (plan.status === 'completed') {
      navigate(`/recovery/${plan.id}/summary`);
    } else if (needsCheckinToday) {
      navigate(`/recovery/${plan.id}/checkin`);
    } else {
      navigate(`/recovery/${plan.id}`);
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">恢复观察</CardTitle>
          </div>
          {needsCheckinToday && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full animate-pulse">
              今日待记录
            </span>
          )}
          {plan.status === 'completed' && (
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
              已完成
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {petName} · {plan.main_symptom}
          </span>
          <span className="font-medium">
            第 {completedDays} / {totalDays} 天
          </span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            开始于 {format(new Date(plan.created_at), 'M月d日', { locale: zhCN })}
          </span>
          <Button variant="ghost" size="sm" className="h-7 px-2">
            {plan.status === 'completed' ? '查看总结' : needsCheckinToday ? '立即记录' : '查看详情'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
