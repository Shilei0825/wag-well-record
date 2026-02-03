import { useState, useEffect } from 'react';
import { Camera, Image, Settings, ChevronRight, Flame, Calendar, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/hooks/usePets';
import { useCheckIns, useCreateCheckIn, useTodayCheckIn, useCheckInStreak } from '@/hooks/useCheckIns';
import { BottomNav } from '@/components/BottomNav';
import { JourneyPath } from '@/components/JourneyPath';
import { CheckInCamera } from '@/components/CheckInCamera';
import { CheckInAnimation } from '@/components/CheckInAnimation';
import { SlideshowPlayer } from '@/components/SlideshowPlayer';
import { toast } from 'sonner';

export default function MyPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { data: pets = [] } = usePets();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showCheckInAnimation, setShowCheckInAnimation] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  
  const selectedPet = pets.find(p => p.id === selectedPetId) || pets[0];
  
  const { data: todayCheckIn } = useTodayCheckIn(selectedPet?.id || '');
  const { data: streak = 0 } = useCheckInStreak(selectedPet?.id);
  const { data: allCheckIns = [] } = useCheckIns(selectedPet?.id);
  const createCheckIn = useCreateCheckIn();
  
  // Set default selected pet
  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  const handleCheckIn = async (file: File) => {
    if (!selectedPet) {
      toast.error(language === 'zh' ? '请先选择宠物' : 'Please select a pet first');
      return;
    }
    
    try {
      await createCheckIn.mutateAsync({ petId: selectedPet.id, photoFile: file });
      setShowCamera(false);
      setShowCheckInAnimation(true);
    } catch (error: any) {
      console.error('Check-in error:', error);
      if (error.code === '23505') {
        toast.error(language === 'zh' ? '今天已经打卡过了' : 'Already checked in today');
      } else {
        toast.error(language === 'zh' ? '打卡失败' : 'Check-in failed');
      }
    }
  };

  const photos = allCheckIns.map(c => c.photo_url);

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {language === 'zh' ? '我的' : 'My'}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
          className="text-muted-foreground"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Pet Selector */}
      {pets.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {pets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => setSelectedPetId(pet.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedPetId === pet.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {pet.species === 'dog' ? '🐕' : '🐱'} {pet.name}
            </button>
          ))}
        </div>
      )}

      {/* Check-in Card */}
      <motion.div
        className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 mb-6 border border-primary/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {language === 'zh' ? '每日打卡' : 'Daily Check-in'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">
                {language === 'zh' 
                  ? `连续打卡 ${streak} 天` 
                  : `${streak} day streak`}
              </span>
            </div>
          </div>
          
          {todayCheckIn ? (
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
                <img 
                  src={todayCheckIn.photo_url} 
                  alt="Today's check-in"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-primary font-medium">
                ✓ {language === 'zh' ? '已打卡' : 'Done'}
              </span>
            </div>
          ) : (
            <Button
              onClick={() => setShowCamera(true)}
              className="rounded-full"
              disabled={!selectedPet}
            >
              <Camera className="h-5 w-5 mr-2" />
              {language === 'zh' ? '拍照打卡' : 'Check In'}
            </Button>
          )}
        </div>

        {!selectedPet && (
          <p className="text-sm text-muted-foreground">
            {language === 'zh' 
              ? '请先添加宠物才能开始打卡' 
              : 'Add a pet first to start checking in'}
          </p>
        )}
      </motion.div>

      {/* Journey Path */}
      {selectedPet && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {language === 'zh' ? '打卡足迹' : 'Check-in Journey'}
            </h2>
          </div>
          <JourneyPath petId={selectedPet.id} />
        </div>
      )}

      {/* Slideshow Button */}
      {photos.length > 0 && (
        <motion.button
          onClick={() => setShowSlideshow(true)}
          className="w-full bg-card rounded-2xl p-4 border border-border flex items-center justify-between hover:bg-accent/50 transition-colors mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Play className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground">
                {language === 'zh' ? '生成回忆相册' : 'Create Memory Album'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' 
                  ? `${photos.length} 张照片` 
                  : `${photos.length} photos`}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </motion.button>
      )}

      {/* Recent Photos Grid */}
      {photos.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Image className="h-5 w-5" />
              {language === 'zh' ? '最近打卡' : 'Recent Check-ins'}
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {photos.slice(0, 6).map((photo, index) => (
              <motion.div
                key={index}
                className="aspect-square rounded-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <img 
                  src={photo} 
                  alt={`Check-in ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Settings Links */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/settings')}
          className="w-full card-elevated p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <Settings className="h-5 w-5 text-foreground" />
            </div>
            <span className="font-medium text-foreground">
              {language === 'zh' ? '设置' : 'Settings'}
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <CheckInCamera
            onCapture={handleCheckIn}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>

      {/* Check-in Success Animation */}
      <AnimatePresence>
        {showCheckInAnimation && (
          <CheckInAnimation
            streak={streak + 1}
            onComplete={() => setShowCheckInAnimation(false)}
          />
        )}
      </AnimatePresence>

      {/* Slideshow Player */}
      <AnimatePresence>
        {showSlideshow && (
          <SlideshowPlayer
            photos={photos}
            onClose={() => setShowSlideshow(false)}
            title={selectedPet ? `${selectedPet.name}'s ${language === 'zh' ? '回忆' : 'Memories'}` : undefined}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
