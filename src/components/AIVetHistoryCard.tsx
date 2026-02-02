import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Stethoscope, Trash2, AlertTriangle, Clock, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePets } from '@/hooks/usePets';
import { AIVetConsultation, useDeleteConsultation } from '@/hooks/useAIVetConsultations';
import { AIVetMessage } from './AIVetMessage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AIVetHistoryCardProps {
  consultation: AIVetConsultation;
}

const SYMPTOM_LABELS: Record<string, { en: string; zh: string }> = {
  vomiting: { en: 'Vomiting', zh: '呕吐' },
  diarrhea: { en: 'Diarrhea', zh: '腹泻' },
  not_eating: { en: 'Loss of appetite', zh: '食欲下降' },
  lethargy: { en: 'Lethargy', zh: '精神不振' },
  coughing: { en: 'Coughing', zh: '咳嗽' },
  sneezing: { en: 'Sneezing', zh: '打喷嚏' },
  scratching: { en: 'Skin issues', zh: '皮肤问题' },
  limping: { en: 'Limping', zh: '跛行' },
  eye_issues: { en: 'Eye issues', zh: '眼睛问题' },
  ear_issues: { en: 'Ear issues', zh: '耳朵问题' },
  urination: { en: 'Urination problems', zh: '排尿问题' },
  breathing: { en: 'Breathing issues', zh: '呼吸困难' },
  weight_change: { en: 'Weight change', zh: '体重变化' },
  behavioral: { en: 'Behavioral', zh: '行为变化' },
  other: { en: 'Other', zh: '其他' },
};

const SEVERITY_CONFIG: Record<string, { color: string; icon: typeof AlertTriangle }> = {
  mild: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: Eye },
  moderate: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
  severe: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: AlertTriangle },
  emergency: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: AlertTriangle },
};

const URGENCY_CONFIG: Record<string, string> = {
  '紧急': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Emergency': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  '24小时内': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  '24小时内就医': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'Within 24 hours': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  '观察': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  '可观察': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Monitor': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export function AIVetHistoryCard({ consultation }: AIVetHistoryCardProps) {
  const { language } = useLanguage();
  const { data: pets } = usePets();
  const deleteConsultation = useDeleteConsultation();
  const [isExpanded, setIsExpanded] = useState(false);

  const pet = pets?.find(p => p.id === consultation.pet_id);
  const symptomLabel = SYMPTOM_LABELS[consultation.main_symptom]?.[language] || consultation.main_symptom;
  const severityConfig = SEVERITY_CONFIG[consultation.severity] || SEVERITY_CONFIG.mild;
  const SeverityIcon = severityConfig.icon;

  const severityLabel = language === 'zh' 
    ? { mild: '轻微', moderate: '中等', severe: '严重', emergency: '紧急' }[consultation.severity] || consultation.severity
    : consultation.severity.charAt(0).toUpperCase() + consultation.severity.slice(1);

  // Extract urgency from response or use stored value
  const urgencyLevel = consultation.urgency_level || '';
  const urgencyColor = URGENCY_CONFIG[urgencyLevel] || 'bg-muted text-muted-foreground';

  return (
    <Card className="overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">{pet?.name || '...'}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {format(new Date(consultation.created_at), 'MM/dd HH:mm')}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {symptomLabel}
              </Badge>
              <Badge className={cn('text-xs', severityConfig.color)}>
                <SeverityIcon className="h-3 w-3 mr-1" />
                {severityLabel}
              </Badge>
              {urgencyLevel && (
                <Badge className={cn('text-xs', urgencyColor)}>
                  {urgencyLevel}
                </Badge>
              )}
            </div>

            {consultation.additional_symptoms && consultation.additional_symptoms.length > 0 && (
              <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                {consultation.additional_symptoms.slice(0, 3).map(s => (
                  <span key={s} className="bg-muted px-1.5 py-0.5 rounded">
                    {SYMPTOM_LABELS[s]?.[language] || s}
                  </span>
                ))}
                {consultation.additional_symptoms.length > 3 && (
                  <span className="text-muted-foreground">
                    +{consultation.additional_symptoms.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {language === 'zh' ? '删除咨询记录？' : 'Delete consultation?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {language === 'zh' 
                      ? '此操作无法撤销，记录将被永久删除。' 
                      : 'This action cannot be undone. The record will be permanently deleted.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {language === 'zh' ? '取消' : 'Cancel'}
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => deleteConsultation.mutate(consultation.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {language === 'zh' ? '删除' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && consultation.full_response && (
        <CardContent className="pt-0 pb-4 border-t">
          <div className="mt-4 bg-muted/30 rounded-lg p-4">
            <AIVetMessage content={consultation.full_response} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
