import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  useRecoveryPlan, 
  useRecoveryCheckins, 
  useCreateRecoveryCheckin,
  useUpdateRecoveryPlan,
  AppetiteLevel,
  EnergyLevel,
  SymptomStatus
} from "@/hooks/useRecoveryPlans";
import { usePets } from "@/hooks/usePets";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays } from "date-fns";
import { Utensils, Zap, Activity, ChevronRight } from "lucide-react";

export default function RecoveryCheckin() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: plan, isLoading: planLoading } = useRecoveryPlan(planId || '');
  const { data: checkins = [] } = useRecoveryCheckins(planId || '');
  const { data: pets = [] } = usePets();
  const createCheckin = useCreateRecoveryCheckin();
  const updatePlan = useUpdateRecoveryPlan();

  const [appetite, setAppetite] = useState<AppetiteLevel | ''>('');
  const [energy, setEnergy] = useState<EnergyLevel | ''>('');
  const [symptomStatus, setSymptomStatus] = useState<SymptomStatus | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pet = pets.find(p => p.id === plan?.pet_id);
  const completedDays = checkins.length;
  const daysSinceStart = plan ? differenceInDays(new Date(), new Date(plan.created_at)) + 1 : 1;
  const currentDayIndex = Math.min(daysSinceStart, plan?.duration_days || 3);

  // Check if already checked in today
  const alreadyCheckedInToday = checkins.some(c => c.day_index === currentDayIndex);

  useEffect(() => {
    if (alreadyCheckedInToday && plan) {
      navigate(`/recovery/${plan.id}`);
    }
  }, [alreadyCheckedInToday, plan, navigate]);

  const handleSubmit = async () => {
    if (!planId || !appetite || !energy || !symptomStatus) {
      toast({
        title: "请完成所有问题",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createCheckin.mutateAsync({
        plan_id: planId,
        day_index: currentDayIndex,
        appetite,
        energy,
        symptom_status: symptomStatus,
        notes: notes || undefined,
      });

      // Check if this was the last day
      if (currentDayIndex >= (plan?.duration_days || 3)) {
        // Generate AI summary
        const allCheckins = [...checkins, {
          day_index: currentDayIndex,
          appetite,
          energy,
          symptom_status: symptomStatus,
        }];

        const { data: summaryData, error: summaryError } = await supabase.functions.invoke('recovery-summary', {
          body: {
            petName: pet?.name || '宠物',
            mainSymptom: plan?.main_symptom || '',
            checkins: allCheckins,
          },
        });

        if (summaryError) {
          console.error('Summary error:', summaryError);
        }

        // Update plan with summary and mark as completed
        await updatePlan.mutateAsync({
          id: planId,
          status: 'completed',
          completed_at: new Date().toISOString(),
          ai_summary: summaryData?.summary || null,
          recovery_trend: summaryData?.trend || null,
          suggestion: summaryData?.suggestion || null,
        });

        toast({
          title: "恢复观察完成！",
          description: "已生成 AI 总结",
        });

        navigate(`/recovery/${planId}/summary`);
      } else {
        toast({
          title: "记录成功",
          description: `第 ${currentDayIndex} 天记录已保存`,
        });
        navigate(`/recovery/${planId}`);
      }
    } catch (error) {
      console.error('Checkin error:', error);
      toast({
        title: "记录失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const progress = (completedDays / plan.duration_days) * 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-6">
        <PageHeader title="今日记录" showBack />

        {/* Progress */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {pet?.name} · {plan.main_symptom}
              </span>
              <span className="text-sm font-medium">
                第 {currentDayIndex} / {plan.duration_days} 天
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">今天的食欲如何？</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={appetite}
              onValueChange={(v) => setAppetite(v as AppetiteLevel)}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { value: 'normal', label: '正常', emoji: '😋' },
                { value: 'reduced', label: '减少', emoji: '😐' },
                { value: 'poor', label: '很差', emoji: '😔' },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`appetite-${option.value}`}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    appetite === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`appetite-${option.value}`}
                    className="sr-only"
                  />
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">今天的精力状态？</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={energy}
              onValueChange={(v) => setEnergy(v as EnergyLevel)}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { value: 'normal', label: '正常', emoji: '🐕' },
                { value: 'low', label: '较低', emoji: '😴' },
                { value: 'very_low', label: '很低', emoji: '😪' },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`energy-${option.value}`}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    energy === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`energy-${option.value}`}
                    className="sr-only"
                  />
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">症状相比昨天？</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={symptomStatus}
              onValueChange={(v) => setSymptomStatus(v as SymptomStatus)}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { value: 'improved', label: '好转', emoji: '📈' },
                { value: 'same', label: '持平', emoji: '➡️' },
                { value: 'worse', label: '加重', emoji: '📉' },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`symptom-${option.value}`}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    symptomStatus === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`symptom-${option.value}`}
                    className="sr-only"
                  />
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Optional notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">补充说明（可选）</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="有其他观察到的情况吗？"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!appetite || !energy || !symptomStatus || isSubmitting}
          className="w-full h-12 text-base"
        >
          {isSubmitting ? '保存中...' : currentDayIndex >= plan.duration_days ? '完成观察' : '保存记录'}
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
