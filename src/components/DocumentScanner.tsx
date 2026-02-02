import { useState, useRef } from 'react';
import { Camera, Loader2, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DocumentScannerProps {
  documentType: 'expense' | 'visit' | 'health_record';
  onScanComplete: (data: any) => void;
  className?: string;
}

export function DocumentScanner({ documentType, onScanComplete, className }: DocumentScannerProps) {
  const { t, language } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'zh' ? '请选择图片文件' : 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'zh' ? '图片大小不能超过5MB' : 'Image size must be under 5MB');
      return;
    }

    setIsScanning(true);

    try {
      // Convert to base64
      const base64 = await fileToBase64(file);
      
      // Call edge function
      const { data, error } = await supabase.functions.invoke('scan-document', {
        body: {
          imageBase64: base64,
          documentType,
          language,
        },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        toast.success(language === 'zh' ? '扫描成功' : 'Scan successful');
        onScanComplete(data.data);
      } else {
        throw new Error(data?.error || 'Scan failed');
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      toast.error(language === 'zh' ? '扫描失败，请手动填写' : 'Scan failed, please fill in manually');
    } finally {
      setIsScanning(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className="w-full h-24 border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all"
      >
        <div className="flex flex-col items-center gap-2">
          {isScanning ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">
                {language === 'zh' ? '正在识别...' : 'Scanning...'}
              </span>
            </>
          ) : (
            <>
              <div className="relative">
                <Camera className="h-8 w-8 text-primary" />
                <ScanLine className="h-4 w-4 text-primary absolute -bottom-1 -right-1" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {t('scan.tapToScan')}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('scan.autoFill')}
              </span>
            </>
          )}
        </div>
      </Button>
    </div>
  );
}
