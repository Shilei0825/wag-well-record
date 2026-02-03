import { useState, useRef } from 'react';
import { Dog, Cat, Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PetAvatarUploadProps {
  petId: string;
  species: 'dog' | 'cat';
  currentAvatarUrl?: string | null;
  onUploadComplete: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function PetAvatarUpload({
  petId,
  species,
  currentAvatarUrl,
  onUploadComplete,
  size = 'md',
}: PetAvatarUploadProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-14 w-14',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const cameraSizes = {
    sm: 'h-6 w-6',
    md: 'h-7 w-7',
    lg: 'h-8 w-8',
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'zh' ? '请选择图片文件' : 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'zh' ? '图片大小不能超过5MB' : 'Image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${petId}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('pet-avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet-avatars')
        .getPublicUrl(fileName);

      // Add cache buster to force refresh
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;

      // Update pet record
      const { error: updateError } = await supabase
        .from('pets')
        .update({ avatar_url: urlWithCacheBuster })
        .eq('id', petId);

      if (updateError) throw updateError;

      onUploadComplete(urlWithCacheBuster);
      toast.success(language === 'zh' ? '头像已更新' : 'Avatar updated');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(language === 'zh' ? '上传失败，请重试' : 'Upload failed, please try again');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={cn(
          'relative rounded-full flex items-center justify-center overflow-hidden transition-all',
          sizeClasses[size],
          currentAvatarUrl
            ? 'bg-muted'
            : species === 'dog'
              ? 'bg-pet-dog/10'
              : 'bg-pet-cat/10',
          'hover:ring-2 hover:ring-primary/50'
        )}
      >
        {currentAvatarUrl ? (
          <img
            src={currentAvatarUrl}
            alt="Pet avatar"
            className="h-full w-full object-cover"
          />
        ) : species === 'dog' ? (
          <Dog className={cn(iconSizes[size], 'text-pet-dog')} />
        ) : (
          <Cat className={cn(iconSizes[size], 'text-pet-cat')} />
        )}

        {/* Overlay on hover */}
        <div className={cn(
          'absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity',
          uploading && 'opacity-100'
        )}>
          {uploading ? (
            <Loader2 className={cn(cameraSizes[size], 'text-white animate-spin')} />
          ) : (
            <Camera className={cn(cameraSizes[size], 'text-white')} />
          )}
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
