import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  X,
  Music,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';

// Preset music tracks (royalty-free)
const MUSIC_TRACKS = [
  { id: 'happy', name: { zh: '欢乐时光', en: 'Happy Times' }, emoji: '🎉' },
  { id: 'peaceful', name: { zh: '宁静时刻', en: 'Peaceful Moments' }, emoji: '🌿' },
  { id: 'playful', name: { zh: '活力满满', en: 'Playful Energy' }, emoji: '🐕' },
  { id: 'emotional', name: { zh: '温馨回忆', en: 'Sweet Memories' }, emoji: '💕' },
  { id: 'adventure', name: { zh: '冒险旅程', en: 'Adventure Journey' }, emoji: '🌟' },
];

interface SlideshowPlayerProps {
  photos: string[];
  onClose: () => void;
  title?: string;
}

export function SlideshowPlayer({ photos, onClose, title }: SlideshowPlayerProps) {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [selectedTrack, setSelectedTrack] = useState(MUSIC_TRACKS[0]);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance slides
  useEffect(() => {
    if (isPlaying && photos.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }, 3000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, photos.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const handleDownload = () => {
    // In a real implementation, this would trigger slideshow video generation
    // For now, we'll show a message
    alert(language === 'zh' ? '视频生成中，请稍候...' : 'Generating video, please wait...');
  };

  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-4">{language === 'zh' ? '暂无照片' : 'No photos available'}</p>
          <Button onClick={onClose} variant="outline">
            {language === 'zh' ? '返回' : 'Go Back'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>
        
        <h2 className="text-white font-medium">
          {title || (language === 'zh' ? '回忆相册' : 'Memory Album')}
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          className="text-white hover:bg-white/20"
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>

      {/* Photo Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={photos[currentIndex]}
            alt={`Photo ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      {photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Progress dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-32 left-0 right-0 flex items-center justify-center gap-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-4'
                  : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center justify-between gap-4">
          {/* Play/Pause */}
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>

          {/* Music selector */}
          <Button
            variant="ghost"
            onClick={() => setShowMusicPicker(!showMusicPicker)}
            className="text-white hover:bg-white/20 flex items-center gap-2"
          >
            <Music className="h-5 w-5" />
            <span className="text-sm">
              {selectedTrack.emoji} {selectedTrack.name[language]}
            </span>
          </Button>

          {/* Volume controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.1}
              className="w-20"
            />
          </div>
        </div>

        {/* Music picker dropdown */}
        <AnimatePresence>
          {showMusicPicker && (
            <motion.div
              className="absolute bottom-20 left-4 right-4 bg-background/95 backdrop-blur rounded-xl p-4 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <h3 className="text-sm font-medium mb-3 text-foreground">
                {language === 'zh' ? '选择背景音乐' : 'Choose Background Music'}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {MUSIC_TRACKS.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setSelectedTrack(track);
                      setShowMusicPicker(false);
                    }}
                    className={`p-3 rounded-lg text-left transition-all ${
                      selectedTrack.id === track.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    <span className="text-xl mr-2">{track.emoji}</span>
                    <span className="text-sm">{track.name[language]}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
