import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, ClipboardList } from 'lucide-react';

interface IntakeData {
  mainSymptom: string;
  duration: string;
  severity: string;
  additionalSymptoms: string[];
  additionalNotes: string;
}

interface AIVetIntakeFormProps {
  onSubmit: (data: IntakeData) => void;
  onSkipToChat: () => void;
}

const SYMPTOM_OPTIONS = {
  en: [
    { value: 'vomiting', label: 'Vomiting' },
    { value: 'diarrhea', label: 'Diarrhea' },
    { value: 'not_eating', label: 'Not eating / Loss of appetite' },
    { value: 'lethargy', label: 'Lethargy / Low energy' },
    { value: 'coughing', label: 'Coughing' },
    { value: 'sneezing', label: 'Sneezing / Runny nose' },
    { value: 'scratching', label: 'Scratching / Skin issues' },
    { value: 'limping', label: 'Limping / Difficulty walking' },
    { value: 'eye_issues', label: 'Eye discharge / Redness' },
    { value: 'ear_issues', label: 'Ear scratching / Head shaking' },
    { value: 'urination', label: 'Urination problems' },
    { value: 'breathing', label: 'Breathing difficulties' },
    { value: 'weight_change', label: 'Weight loss / gain' },
    { value: 'behavioral', label: 'Behavioral changes' },
    { value: 'other', label: 'Other' },
  ],
  zh: [
    { value: 'vomiting', label: '呕吐' },
    { value: 'diarrhea', label: '腹泻' },
    { value: 'not_eating', label: '不吃东西 / 食欲下降' },
    { value: 'lethargy', label: '精神不振 / 嗜睡' },
    { value: 'coughing', label: '咳嗽' },
    { value: 'sneezing', label: '打喷嚏 / 流鼻涕' },
    { value: 'scratching', label: '抓挠 / 皮肤问题' },
    { value: 'limping', label: '跛行 / 行走困难' },
    { value: 'eye_issues', label: '眼睛分泌物 / 发红' },
    { value: 'ear_issues', label: '抓耳朵 / 摇头' },
    { value: 'urination', label: '排尿问题' },
    { value: 'breathing', label: '呼吸困难' },
    { value: 'weight_change', label: '体重变化' },
    { value: 'behavioral', label: '行为变化' },
    { value: 'other', label: '其他' },
  ],
};

const DURATION_OPTIONS = {
  en: [
    { value: 'today', label: 'Just today' },
    { value: '1-3days', label: '1-3 days' },
    { value: '4-7days', label: '4-7 days' },
    { value: '1-2weeks', label: '1-2 weeks' },
    { value: 'over2weeks', label: 'Over 2 weeks' },
    { value: 'recurring', label: 'Recurring issue' },
  ],
  zh: [
    { value: 'today', label: '今天开始' },
    { value: '1-3days', label: '1-3天' },
    { value: '4-7days', label: '4-7天' },
    { value: '1-2weeks', label: '1-2周' },
    { value: 'over2weeks', label: '超过2周' },
    { value: 'recurring', label: '反复发作' },
  ],
};

const SEVERITY_OPTIONS = {
  en: [
    { value: 'mild', label: 'Mild - Pet is mostly normal', description: 'Eating, drinking, and behaving relatively normally' },
    { value: 'moderate', label: 'Moderate - Noticeable changes', description: 'Some changes in behavior, appetite, or activity' },
    { value: 'severe', label: 'Severe - Significant concern', description: 'Major changes, pet seems very unwell' },
    { value: 'emergency', label: 'Emergency - Urgent', description: 'Collapse, difficulty breathing, severe bleeding, etc.' },
  ],
  zh: [
    { value: 'mild', label: '轻微 - 宠物基本正常', description: '饮食、饮水和行为相对正常' },
    { value: 'moderate', label: '中等 - 有明显变化', description: '行为、食欲或活动有一些变化' },
    { value: 'severe', label: '严重 - 明显异常', description: '重大变化，宠物看起来很不舒服' },
    { value: 'emergency', label: '紧急 - 需立即处理', description: '虚脱、呼吸困难、严重出血等' },
  ],
};

export function AIVetIntakeForm({ onSubmit, onSkipToChat }: AIVetIntakeFormProps) {
  const { language, t } = useLanguage();
  const [mainSymptom, setMainSymptom] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [additionalSymptoms, setAdditionalSymptoms] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const symptoms = SYMPTOM_OPTIONS[language];
  const durations = DURATION_OPTIONS[language];
  const severities = SEVERITY_OPTIONS[language];

  const handleSymptomToggle = (value: string) => {
    setAdditionalSymptoms(prev => 
      prev.includes(value) 
        ? prev.filter(s => s !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = () => {
    onSubmit({
      mainSymptom,
      duration,
      severity,
      additionalSymptoms,
      additionalNotes,
    });
  };

  const isValid = mainSymptom && duration && severity;

  return (
    <div className="space-y-6">
      {/* Main Symptom */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</span>
            {language === 'zh' ? '主要症状是什么？' : 'What is the main symptom?'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={mainSymptom} onValueChange={setMainSymptom}>
            <SelectTrigger>
              <SelectValue placeholder={language === 'zh' ? '选择主要症状' : 'Select main symptom'} />
            </SelectTrigger>
            <SelectContent>
              {symptoms.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Duration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</span>
            {language === 'zh' ? '症状持续多长时间？' : 'How long has this been going on?'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue placeholder={language === 'zh' ? '选择持续时间' : 'Select duration'} />
            </SelectTrigger>
            <SelectContent>
              {durations.map(d => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Severity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</span>
            {language === 'zh' ? '症状严重程度？' : 'How severe is the condition?'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={severity} onValueChange={setSeverity} className="space-y-3">
            {severities.map(s => (
              <div key={s.value} className="flex items-start space-x-3">
                <RadioGroupItem value={s.value} id={s.value} className="mt-1" />
                <Label htmlFor={s.value} className="cursor-pointer">
                  <div className="font-medium">{s.label}</div>
                  <div className="text-sm text-muted-foreground">{s.description}</div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Additional Symptoms */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">4</span>
            {language === 'zh' ? '是否有其他症状？（可选）' : 'Any other symptoms? (Optional)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {symptoms.filter(s => s.value !== mainSymptom).map(s => (
              <div key={s.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`additional-${s.value}`}
                  checked={additionalSymptoms.includes(s.value)}
                  onCheckedChange={() => handleSymptomToggle(s.value)}
                />
                <Label 
                  htmlFor={`additional-${s.value}`} 
                  className="text-sm cursor-pointer"
                >
                  {s.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">5</span>
            {language === 'zh' ? '其他需要补充的信息（可选）' : 'Any additional information? (Optional)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder={language === 'zh' 
              ? '例如：最近饮食变化、接触过其他动物、已尝试的治疗等...' 
              : 'E.g., recent diet changes, contact with other animals, treatments tried...'}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <Button 
          onClick={handleSubmit} 
          disabled={!isValid}
          className="w-full"
          size="lg"
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          {language === 'zh' ? '获取建议' : 'Get Suggestions'}
        </Button>
        <Button 
          variant="outline" 
          onClick={onSkipToChat}
          className="w-full"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {language === 'zh' ? '直接开始对话' : 'Skip to Free Chat'}
        </Button>
      </div>
    </div>
  );
}
