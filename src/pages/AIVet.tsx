import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Loader2, Stethoscope, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePets } from '@/hooks/usePets';
import { BottomNav } from '@/components/BottomNav';
import { AIVetIntakeForm } from '@/components/AIVetIntakeForm';
import { AIVetMessage } from '@/components/AIVetMessage';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface IntakeData {
  mainSymptom: string;
  duration: string;
  severity: string;
  additionalSymptoms: string[];
  additionalNotes: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-vet`;

// Mapping for symptom/duration/severity labels
const SYMPTOM_LABELS: Record<string, { en: string; zh: string }> = {
  vomiting: { en: 'Vomiting', zh: '呕吐' },
  diarrhea: { en: 'Diarrhea', zh: '腹泻' },
  not_eating: { en: 'Not eating / Loss of appetite', zh: '不吃东西 / 食欲下降' },
  lethargy: { en: 'Lethargy / Low energy', zh: '精神不振 / 嗜睡' },
  coughing: { en: 'Coughing', zh: '咳嗽' },
  sneezing: { en: 'Sneezing / Runny nose', zh: '打喷嚏 / 流鼻涕' },
  scratching: { en: 'Scratching / Skin issues', zh: '抓挠 / 皮肤问题' },
  limping: { en: 'Limping / Difficulty walking', zh: '跛行 / 行走困难' },
  eye_issues: { en: 'Eye discharge / Redness', zh: '眼睛分泌物 / 发红' },
  ear_issues: { en: 'Ear scratching / Head shaking', zh: '抓耳朵 / 摇头' },
  urination: { en: 'Urination problems', zh: '排尿问题' },
  breathing: { en: 'Breathing difficulties', zh: '呼吸困难' },
  weight_change: { en: 'Weight loss / gain', zh: '体重变化' },
  behavioral: { en: 'Behavioral changes', zh: '行为变化' },
  other: { en: 'Other', zh: '其他' },
};

const DURATION_LABELS: Record<string, { en: string; zh: string }> = {
  today: { en: 'Just today', zh: '今天开始' },
  '1-3days': { en: '1-3 days', zh: '1-3天' },
  '4-7days': { en: '4-7 days', zh: '4-7天' },
  '1-2weeks': { en: '1-2 weeks', zh: '1-2周' },
  over2weeks: { en: 'Over 2 weeks', zh: '超过2周' },
  recurring: { en: 'Recurring issue', zh: '反复发作' },
};

const SEVERITY_LABELS: Record<string, { en: string; zh: string }> = {
  mild: { en: 'Mild', zh: '轻微' },
  moderate: { en: 'Moderate', zh: '中等' },
  severe: { en: 'Severe', zh: '严重' },
  emergency: { en: 'Emergency', zh: '紧急' },
};

type ViewMode = 'intake' | 'chat';

export default function AIVet() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: pets } = usePets();
  
  const [viewMode, setViewMode] = useState<ViewMode>('intake');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedPet = pets?.find(p => p.id === selectedPetId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Calculate pet age from birthdate
  const calculateAge = (birthdate: string | null | undefined): string | null => {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years > 0) {
      return language === 'zh' ? `${years}岁` : `${years} years`;
    }
    return language === 'zh' ? `${months}个月` : `${months} months`;
  };

  // Build initial message from intake form
  const buildIntakeMessage = (data: IntakeData): string => {
    const mainSymptomLabel = SYMPTOM_LABELS[data.mainSymptom]?.[language] || data.mainSymptom;
    const durationLabel = DURATION_LABELS[data.duration]?.[language] || data.duration;
    const severityLabel = SEVERITY_LABELS[data.severity]?.[language] || data.severity;
    
    const additionalSymptomsLabels = data.additionalSymptoms
      .map(s => SYMPTOM_LABELS[s]?.[language] || s)
      .join(', ');

    if (language === 'zh') {
      let msg = `我的宠物出现了以下症状：\n\n`;
      msg += `**主要症状：** ${mainSymptomLabel}\n`;
      msg += `**持续时间：** ${durationLabel}\n`;
      msg += `**严重程度：** ${severityLabel}\n`;
      if (additionalSymptomsLabels) {
        msg += `**其他症状：** ${additionalSymptomsLabels}\n`;
      }
      if (data.additionalNotes) {
        msg += `\n**补充信息：** ${data.additionalNotes}`;
      }
      return msg;
    } else {
      let msg = `My pet is experiencing the following symptoms:\n\n`;
      msg += `**Main symptom:** ${mainSymptomLabel}\n`;
      msg += `**Duration:** ${durationLabel}\n`;
      msg += `**Severity:** ${severityLabel}\n`;
      if (additionalSymptomsLabels) {
        msg += `**Other symptoms:** ${additionalSymptomsLabels}\n`;
      }
      if (data.additionalNotes) {
        msg += `\n**Additional info:** ${data.additionalNotes}`;
      }
      return msg;
    }
  };

  const handleIntakeSubmit = (data: IntakeData) => {
    const intakeMessage = buildIntakeMessage(data);
    setViewMode('chat');
    // Send the message automatically
    setTimeout(() => {
      sendMessageWithContent(intakeMessage);
    }, 100);
  };

  const handleSkipToChat = () => {
    setViewMode('chat');
  };

  const handleRestart = () => {
    setViewMode('intake');
    setMessages([]);
    setInput('');
  };

  const sendMessageWithContent = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: content.trim() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Build pet info for context
    const petInfo = selectedPet ? {
      name: selectedPet.name,
      species: selectedPet.species === 'dog' ? (language === 'zh' ? '狗' : 'Dog') : (language === 'zh' ? '猫' : 'Cat'),
      age: calculateAge(selectedPet.birthdate),
      weight: selectedPet.weight,
    } : null;

    let assistantContent = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      body: JSON.stringify({ 
        messages: [...messages, userMsg],
        petInfo,
        language,
      }),
    });

      if (resp.status === 429) {
        toast.error(language === 'zh' ? '请求过于频繁，请稍后再试' : 'Rate limited, please try again later');
        setIsLoading(false);
        return;
      }

      if (resp.status === 402) {
        toast.error(language === 'zh' ? '服务额度已用完' : 'Service quota exceeded');
        setIsLoading(false);
        return;
      }

      if (!resp.ok || !resp.body) {
        throw new Error('Failed to start stream');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error('AI Vet error:', e);
      toast.error(language === 'zh' ? '发送失败，请重试' : 'Failed to send, please try again');
      // Remove the empty assistant message if error
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1 || prev[prev.length - 1].content !== ''));
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    await sendMessageWithContent(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">{t('aivet.title')}</h1>
          </div>
          {viewMode === 'chat' && messages.length > 0 ? (
            <button onClick={handleRestart} className="p-2 -mr-2" title={language === 'zh' ? '重新开始' : 'Start over'}>
              <RotateCcw className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Pet Selector - Always visible */}
        <div className="p-4 border-b">
          <Select value={selectedPetId} onValueChange={setSelectedPetId}>
            <SelectTrigger>
              <SelectValue placeholder={t('aivet.selectPet')} />
            </SelectTrigger>
            <SelectContent>
              {pets?.map(pet => (
                <SelectItem key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species === 'dog' ? t('pet.dog') : t('pet.cat')})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {viewMode === 'intake' ? (
          /* Intake Form */
          <div className="p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-1">
                {language === 'zh' ? '请描述宠物的症状' : 'Describe your pet\'s symptoms'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' 
                  ? '填写以下信息，帮助宠博士更好地了解情况' 
                  : 'Fill in the details below to help AI Vet understand the situation'}
              </p>
            </div>
            <AIVetIntakeForm 
              onSubmit={handleIntakeSubmit}
              onSkipToChat={handleSkipToChat}
            />
          </div>
        ) : (
          /* Chat View */
          <div className="flex flex-col h-[calc(100vh-180px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <Card className="p-6 text-center bg-muted/50">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">{t('aivet.welcome')}</h3>
                  <p className="text-sm text-muted-foreground">{t('aivet.welcomeDesc')}</p>
                </Card>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <AIVetMessage content={msg.content || '...'} />
                    ) : (
                      <div className="text-sm whitespace-pre-wrap">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4 bg-background">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('aivet.inputPlaceholder')}
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-11 w-11 flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {t('aivet.disclaimer')}
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
